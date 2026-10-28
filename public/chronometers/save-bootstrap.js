(function () {
  "use strict";

  var DB_NAME = "/idbfs";
  var STORE_NAME = "FILE_DATA";
  var BACKUP_URL = "/save-backup/P14_backup_2026-10-28T00-16-11-036Z.bin";
  var BACKUP_MARKER = "surfvt14-player-save-backup-v2";

  function revive(value) {
    if (Array.isArray(value)) return value.map(revive);
    if (!value || typeof value !== "object") return value;
    if (value.__t === "date") return new Date(value.v);
    if (value.__t === "u8") {
      var binary = atob(value.b);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1)
        bytes[i] = binary.charCodeAt(i);
      return bytes;
    }
    var result = {};
    Object.keys(value).forEach(function (key) {
      result[key] = revive(value[key]);
    });
    return result;
  }

  function openDatabase() {
    return new Promise(function (resolve, reject) {
      var request;
      try {
        request = indexedDB.open(DB_NAME, 21);
      } catch (error) {
        reject(error);
        return;
      }
      request.onupgradeneeded = function (event) {
        var db = event.target.result;
        ensureFileStore(db, event.target.transaction);
      };
      request.onsuccess = function () {
        var db = request.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          resolve(db);
          return;
        }
        var nextVersion = db.version + 1;
        db.close();
        var upgrade;
        try {
          upgrade = indexedDB.open(DB_NAME, nextVersion);
        } catch (error) {
          reject(error);
          return;
        }
        upgrade.onupgradeneeded = function (event) {
          var upgraded = event.target.result;
          ensureFileStore(upgraded, event.target.transaction);
        };
        upgrade.onsuccess = function () {
          resolve(upgrade.result);
        };
        upgrade.onerror = function () {
          reject(
            upgrade.error ||
              new Error("Não foi possível atualizar o IndexedDB do Unity"),
          );
        };
      };
      request.onerror = function () {
        if (request.error && request.error.name === "VersionError") {
          openExistingDatabase().then(resolve, reject);
          return;
        }
        reject(request.error || new Error("IndexedDB indisponível"));
      };
      request.onblocked = function () {
        reject(new Error("IndexedDB bloqueado por outra aba"));
      };
    });
  }

  function ensureFileStore(db, transaction) {
    var store = db.objectStoreNames.contains(STORE_NAME)
      ? transaction.objectStore(STORE_NAME)
      : db.createObjectStore(STORE_NAME);
    if (!store.indexNames.contains("timestamp")) {
      store.createIndex("timestamp", "timestamp", { unique: false });
    }
  }

  function openExistingDatabase() {
    return new Promise(function (resolve, reject) {
      var request;
      try {
        request = indexedDB.open(DB_NAME);
      } catch (error) {
        reject(error);
        return;
      }
      request.onsuccess = function () {
        var db = request.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          resolve(db);
          return;
        }
        var nextVersion = db.version + 1;
        db.close();
        var upgrade;
        try {
          upgrade = indexedDB.open(DB_NAME, nextVersion);
        } catch (error) {
          reject(error);
          return;
        }
        upgrade.onupgradeneeded = function (event) {
          var upgraded = event.target.result;
          ensureFileStore(upgraded, event.target.transaction);
        };
        upgrade.onsuccess = function () {
          resolve(upgrade.result);
        };
        upgrade.onerror = function () {
          reject(
            upgrade.error ||
              new Error("Não foi possível atualizar o IndexedDB do Unity"),
          );
        };
      };
      request.onerror = function () {
        reject(request.error || new Error("IndexedDB indisponível"));
      };
      request.onblocked = function () {
        reject(new Error("IndexedDB bloqueado por outra aba"));
      };
    });
  }

  function installRecords(records) {
    return openDatabase().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx;
        try {
          tx = db.transaction([STORE_NAME], "readwrite");
        } catch (error) {
          db.close();
          reject(error);
          return;
        }
        var store = tx.objectStore(STORE_NAME);
        var preservedExistingSave = false;
        var importedCount = 0;
        var keysRequest = store.getAllKeys();
        keysRequest.onsuccess = function () {
          // Preserve an existing player's save. The supplied backup is only a
          // first-install seed; it must never replace progress already present.
          var existingKeys = keysRequest.result.map(String);
          var hasSave = existingKeys.some(function (key) {
            return /^\/idbfs\/[^/]+\/Save\/(?:local|cloud|local_old|cloud_old)$/i.test(
              key,
            );
          });
          if (hasSave) {
            preservedExistingSave = true;
            return;
          }
          try {
            records.forEach(function (row) {
              var key = String(row.k || "");
              if (!/^\/idbfs\/[^/]+(?:\/|$)/.test(key))
                throw new Error("Chave de backup inválida");
              // Merge around existing PlayerPrefs and auxiliary Unity files;
              // importing the seed must not roll back a player's preferences.
              if (existingKeys.indexOf(key) !== -1) return;
              var value = revive(row.v);
              if (store.keyPath === null) store.put(value, key);
              else {
                value[store.keyPath] = key;
                store.put(value);
              }
              importedCount += 1;
            });
          } catch (error) {
            try {
              tx.abort();
            } catch (e) {}
            reject(error);
          }
        };
        keysRequest.onerror = function () {
          try {
            tx.abort();
          } catch (e) {}
          reject(keysRequest.error || new Error("Falha ao verificar o save"));
        };
        tx.oncomplete = function () {
          db.close();
          resolve(
            preservedExistingSave
              ? { preserved: true }
              : { imported: importedCount },
          );
        };
        tx.onabort = function () {
          db.close();
          reject(tx.error || new Error("Falha ao importar o backup"));
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error || new Error("Falha ao gravar o backup"));
        };
      });
    });
  }

  function importBackup() {
    try {
      if (localStorage.getItem(BACKUP_MARKER) === "done")
        return Promise.resolve({ found: true, alreadyApplied: true });
    } catch (e) {
      /* Storage may be disabled; still attempt the import. */
    }
    return fetch(BACKUP_URL, { cache: "no-cache", credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok)
          throw new Error("Backup indisponível (HTTP " + response.status + ")");
        return response.json();
      })
      .then(function (backup) {
        if (!backup || backup.p14backup !== 2 || !Array.isArray(backup.sources))
          throw new Error("Formato de backup não reconhecido");
        var source = backup.sources.find(function (item) {
          return (
            item &&
            Array.isArray(item.indexedDB) &&
            item.indexedDB.some(function (db) {
              return db.name === DB_NAME;
            })
          );
        });
        var database =
          source &&
          source.indexedDB.find(function (db) {
            return db.name === DB_NAME;
          });
        var fileStore =
          database &&
          database.stores &&
          database.stores.find(function (store) {
            return store.name === STORE_NAME;
          });
        if (
          !fileStore ||
          !Array.isArray(fileStore.records) ||
          !fileStore.records.length
        )
          throw new Error("Backup sem arquivos de save do Unity");
        return installRecords(fileStore.records).then(function (result) {
          try {
            localStorage.setItem(BACKUP_MARKER, "done");
          } catch (e) {}
          return Object.assign({ found: true }, result);
        });
      });
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error("Não foi possível carregar " + url));
      };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  function activateBackupSaveGuard() {
    return openDatabase().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx;
        try {
          tx = db.transaction([STORE_NAME], "readonly");
        } catch (error) {
          db.close();
          reject(error);
          return;
        }
        var store = tx.objectStore(STORE_NAME);
        var keysRequest = store.getAllKeys();
        var recordsRequest = store.getAll();
        var keys = [];
        var records = [];
        keysRequest.onsuccess = function () { keys = keysRequest.result; };
        recordsRequest.onsuccess = function () { records = recordsRequest.result; };
        tx.oncomplete = function () {
          db.close();
          var templates = {};
          var fallback = null;
          keys.forEach(function (key, index) {
            key = String(key);
            if (!/^\/idbfs\/[^/]+\/Save\/(?:local|cloud|local_old|cloud_old)$/i.test(key)) return;
            var contents = records[index] && records[index].contents;
            if (!(contents instanceof Uint8Array) || !contents.length) return;
            templates[key] = new Uint8Array(contents);
            if (/\/Save\/cloud$/i.test(key)) fallback = templates[key];
            else if (!fallback) fallback = templates[key];
          });
          if (!Object.keys(templates).length || !fallback) {
            reject(new Error("O backup não contém saves aplicáveis ao Unity"));
            return;
          }
          window.__SURFVT14_SAVE_TEMPLATES = templates;
          window.__SURFVT14_UNLOCK_BYTES = new Uint8Array(fallback);
          var scriptUrl = new URL("infinite-save.js", new URL("./", location.href)).href;
          loadScript(scriptUrl).then(function () {
            if (typeof window.applyInfiniteSave !== "function") {
              reject(new Error("A proteção de save não inicializou"));
              return;
            }
            window.applyInfiniteSave().then(resolve, reject);
          }, reject);
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error || new Error("Falha ao ler os saves importados"));
        };
      });
    });
  }

  function runFallback() {
    var base = new URL("./", location.href);
    return loadScript(new URL("unlock-all.js", base).href)
      .then(function () {
        return loadScript(new URL("infinite-save.js", base).href);
      })
      .then(function () {
        return typeof window.applyInfiniteSave === "function"
          ? window.applyInfiniteSave()
          : { ready: false, reason: "save scripts loaded" };
      });
  }

  window.__SURFVT14_SAVE_SOURCE = "backup-pending";
  window.__SURFVT14_SAVE_READY_PROMISE = importBackup()
    .then(function (result) {
      window.__SURFVT14_SAVE_SOURCE = "backup";
      return activateBackupSaveGuard().then(function (guard) {
        return Object.assign({}, result, { infiniteSave: guard });
      });
    })
    .catch(function (backupError) {
      window.__SURFVT14_SAVE_SOURCE = "unlock-all+infinite-save";
      window.__SURFVT14_SAVE_BACKUP_ERROR = String(
        (backupError && backupError.message) || backupError,
      );
      return runFallback();
    });
})();
