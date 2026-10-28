# Testes SurfVT14

Requisitos: Python com `playwright`, Chromium em `/usr/bin/chromium`, dependências Node do projeto.

1. Execute `npm run dev -- --host 0.0.0.0 --port 3000`.
2. Execute `python -m http.server 8081 --directory public` para os testes isolados dos mapas.
3. Execute:

```sh
BASE_URL=http://127.0.0.1:3000 EVIDENCE_DIR=/tmp/surfvt-evidence python tests/browser-regressions.py
BASE_URL=http://127.0.0.1:3000 python tests/cache-migration.py
MAP_BASE_URL=http://127.0.0.1:8081 python tests/clock-boundaries.py
MAP_BASE_URL=http://127.0.0.1:8081 EVIDENCE_DIR=/tmp/surfvt-evidence python tests/map-startup.py
python tests/map-startup-no-save.py
```

`map-startup-no-save.py` starts its own static server and simulates IndexedDB save calls that never resolve. It checks that Unity still reveals its original game UI and sends the ready message.

Crie previamente a pasta de evidências. Os testes de mapas usam contextos descartáveis, sem saves pessoais, e passam pelos diálogos originais antes de iniciar uma partida. Não edite código enquanto o teste usa o servidor Vite: HMR pode descartar o iframe e invalidar a execução. O teste móvel usa emulação Chromium e não substitui um iPhone/Safari real.

Para detectar regressões de restrição de domínio de Bangkok, repita o teste com MAP_BASE_URL=http://127.0.0.2:8081: esse endereço de loopback não pertence à antiga lista permitida, que incluía somente 127.0.0.1 e localhost. Isso exige o servidor escutando em todas as interfaces, como no comando acima.
