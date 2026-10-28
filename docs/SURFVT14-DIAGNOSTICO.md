# SurfVT14 — investigação e correções (27/10/2026)

Base investigada: `main`, `861df86d38c9780cf3b6c80384ea5e0c7b5fb543`.
Integrado também o commit concorrente `4fb024fb5b43f1353b6932247a8489f475065b60` (evitar gravações repetidas das preferências do visualizador interno), preservando essa otimização.

Revisados os commits 111978b6, de9e71ec, 4a323f0c, 63fac860, accf301a e 861df86d. Eles não foram tratados como comprovação de funcionamento.

## Causas e mudanças

### Cronômetros

- `timer-settings.js` chamava `frame.parent.postMessage`, mas `frame` não existia. O Chromium reproduziu `ReferenceError: frame is not defined`; a escolha visual mudava, porém o controlador mantinha o modo anterior.
- O menu aplica imediatamente sua configuração ao controlador e comunica as preferências ao React usando `window.parent`. Ambos preservam modo, hotkeys e modo automático.
- A URL do iframe continha `JSON.stringify(settings)` diretamente. Mudar preferências navegava novamente o iframe, recriando Unity, DOM, listeners e cronômetros. A configuração inicial agora fica estável; alterações chegam por mensagens.
- A ocultação de pré-carregamento dependia também de baixar scripts de personalização e um segundo visualizador de teclas. Agora depende apenas dos quatro scripts essenciais; o menu carrega separadamente. O visualizador interno deixou de ser injetado: o painel visível é React.
- Floating Clock existia com `#p14-floatingclock`, API e `display` visível no teste da produção com Barcelona. A ausência inicial relatada não foi reproduzida isoladamente; não há evidência de um defeito intrínseco na criação desse elemento. Falhas de inicialização, a tela de loading acima do jogo e código antigo em cache impediam concluir esse fluxo. Foram corrigidos os bloqueios comprovados, sem alegar que um CSS oculto inexistente foi encontrado.
- Iniciar após pausa usa `resume`, preservando a contagem. A contagem do visual selecionado acompanha a fonte LiveSplit, inclusive quando uma nova run zera o tempo sem mudar o estado running. Posições de Chrono e Floating Clock passam a ser salvas; fontes, cores, tamanho e fundo existentes permanecem disponíveis.

### Keystrokes

- Eventos físicos no iframe não sobem ao React. Listeners no `document` instalados depois do carregamento podiam ser bloqueados por listeners de captura no `window` com `stopImmediatePropagation`.
- Apenas quatro HTMLs tinham recebido o encaminhamento visual anterior. Os demais mapas compatíveis continuavam usando outra implementação.
- Um único `input-bridge.js`, carregado antes de Unity, observa a tecla física, informa seu estado por `postMessage` e remapeia o movimento uma única vez. Os blocos duplicados nos 26 HTMLs foram substituídos pelo script comum.
- O painel React mantém um conjunto de teclas pressionadas, ignora eventos sintéticos e limpa o estado ao perder foco. As configurações personalizadas também são enviadas nas atualizações do hub.
- Mensagens aceitas pela nova ponte exigem origem e janela pai corretas. Controles de toque continuam enviando mensagens para a mesma ponte.

### Winter Holiday, México e Barcelona

- Os arquivos referenciados nos manifestos existem, incluindo WASM compartilhado. Não foram substituídos binários por builds de outros mapas.
- As builds contêm chamadas do Poki através de `Application.ExternalEval`, mas `_JS_Eval_EvalJS` estava comentada nos três `4399.z.js`. Isso impedia a comunicação correta com o SDK. O callback foi restaurado.
- A inicialização registra agora o nome real do GameObject do SDK, incluindo `(singleton) PokiUnitySDK`, em vez de inventar um nome no callback do runtime.
- A tela externa é liberada pelo registro real do SDK/callbacks do jogo. Isso também permite acessar os diálogos originais de idade/consentimento; aguardar somente o menu principal impediria interagir com esses diálogos.
- Foram removidas liberações por mero timeout, presença de instância Unity ou downloads em 100%. Há mensagens de erro se a inicialização não é confirmada. Repetir uma tentativa recarrega o documento, evitando criar outra instância WebGL no mesmo DOM.
- Atualizações de save/unlock continuam existindo e não são mais requisito para liberar o menu após o sinal do SDK.

### Bangkok

- A build é diferente: dados de Bangkok 1.102.0 e manifesto originalmente rotulado 2018.4; o runtime identifica-se como Unity 5.6.3p1; foi analisada separadamente.
- O `.data.unityweb` publicado e o da main eram idênticos: SHA-256 `faeab6b90363a0eee68b2f7f639c04228e4deaee3a4f0e86a88942ed21b8ceeb`. Seus assets identificam Bangkok, não Crossy Road.
- A navegação para Crossy Road foi reproduzida no domínio publicado. O framework WASM contém um setTimeout de dois segundos com hostname e destinos codificados em base64. A lista aceita somente localhost, 127.0.0.1 e game-cdn.poki.com. Fora deles, escreve diretamente em window.top.location o destino http://po.ki/sitelockredirect, que redireciona para games.poki.com/458768/crossyroad. Por isso testes em localhost não detectavam o erro.
- O HTML define o bloqueio de Application.OpenURL, mas a verificação de hostname o contornava. A correção definitiva remove apenas esse temporizador de redirecionamento e a injeção de anti-debug associada do framework. WASM e dados de Bangkok permanecem intactos. O manifesto ganhou uma nova query derivada do SHA-256 do framework, para invalidar caches, e a versão descritiva foi corrigida para Unity 5.6.3p1.

- No teste móvel de Bangkok, o diálogo original ignorou toques, mas respondeu a cliques de mouse nas mesmas coordenadas. `touch-input.js`, exclusivo dessa build, converte um gesto de um dedo em eventos de mouse e suprime a duplicação de eventos de compatibilidade. As outras builds mantêm seus eventos nativos de toque.

### Mapas que paravam perto de 94% no Brave

- O caminho comum de 22 builds esperava o sistema de save e unlock concluir até 12 tentativas de quatro segundos antes de revelar o jogo. Essas operações dependem de IndexedDB e podem ficar bloqueadas ou sem um save inicial no Brave.
- Esse trabalho não é requisito para inicializar o Unity. A espera foi removida; `revealGame()` exibe a interface assim que o runtime está pronto, e a rotina periódica continua tentando gravar os saves em segundo plano. Não apagamos nem substituímos recordes.
- O teste `map-startup-no-save.py` deixa `applyUnlockAll` e `applyInfiniteSave` pendentes e confirma que Cairo ainda envia `SURFVT14_GAME_READY`, cria o canvas e revela a interface. Passou em 11 segundos, contra a espera potencial de até cerca de 48 segundos do fluxo antigo.
- A barra do hub também pode mostrar progresso estimado enquanto aguarda prontidão; esse número não representa necessariamente bytes transferidos. No teste publicado de Cairo, o progresso interno avançou de 0% a 100%, e a tela original apareceu. A correção também foi aplicada ao Zurich, cuja build usava o mesmo bloqueio.

### Por que deploys anteriores podiam não resolver

O service worker `v20` guardava os mapas por cache-first e eliminava toda a query string da chave, incluindo versões dos assets. Assim, usuários antigos podiam continuar executando HTML, SDK e manifestos anteriores aos commits citados. O cache foi migrado para `v21`; HTML/JS/JSON usam rede primeiro, com fallback offline. Parâmetros de versão de assets são preservados. Preferências e saves não são apagados.

## Validação e limites

Os scripts em `tests/` documentam os testes de navegador e de cache. Usam Python Playwright e Chromium instalado, com um servidor Vite para o hub e um servidor estático para os mapas. `map-startup.py` interage com a interface original, inicia partidas e exige `gameplayStart` e `roundStart`; HTTP 200 ou canvas sozinho não contam como sucesso.

O build de produção passou. O lint dirigido aos dois componentes React passou sem erros, com quatro avisos de dependências de hooks. O lint completo não está limpo; a execução final retornou 3.748 erros e 10 avisos, em grande parte formatação e código legado. O TypeScript ainda acusa problemas em `src/routes/__root.tsx`, `src/server.ts` e `vite.config.ts`, fora das correções de jogo. Esses problemas não foram disfarçados como verificações aprovadas.

Não houve acesso a iPhone/Safari ou Android físico. Emulação móvel em Chromium não comprova compatibilidade com Safari/iOS, limites de memória de aparelhos reais ou todas as GPUs. O Unity continua registrando avisos antigos de OnlineSettings e requisições externas de anúncios/telemetria; não são tratados como prova de falha quando o menu e a partida são comprovados.

Resultados locais confirmados:

- Floating Clock → Chrono → LiveSplit → Floating Clock: um visual de cada vez, start/pause/resume/reset e iframe preservado.
- Seleção persistida ao abrir outro mapa.
- WASD, IJKL, setas e personalizados M/T/F/G: destaque na cor `#a12bef`, soltura, foco no iframe e um único evento de movimento. Duas teclas simultâneas também foram verificadas.
- Os três timers acompanharam reinício automático de contagem mesmo mantendo o estado running.
- Winter Holiday, México, Barcelona e Bangkok: partida confirmada em desktop por gameplayStart/roundStart e capturas do jogo.
- Winter Holiday, México e Barcelona: partida confirmada com touchscreen emulado.
- Cache contaminado com HTML antigo: atualização online comprovada; query de versão preservada.

- Bangkok móvel: a primeira tentativa de converter toque em clique ainda não avançava. O teste identificou a necessidade de enviar movimento antes do pressionamento e separar a liberação por um frame. Após a correção, idade, consentimento e partida foram confirmados com touchscreen e user-agent Android; gameplayStart e roundStart apareceram, sem erros JavaScript.

SHA do commit e estado do deploy são informados no relatório de entrega após a publicação.


Teste complementar de Bangkok: partida iniciada com toque em http://127.0.0.2:8081, hostname fora da lista antiga. O defeito foi também reproduzido no domínio público antes dessa correção; a comparação byte a byte do framework provou que não era um deploy com outro arquivo.

### Backup de save e URLs por jogo

- O arquivo enviado `P14_backup_2026-10-28T00-16-11-036Z.bin` é JSON P14 Backup v2, não um binário executável. A origem inclui um IndexedDB `/idbfs` versão 21 com 12 entradas, entre elas PlayerPrefs e saves local/cloud da build Iceland. O backup é importado em `FILE_DATA`, reconstruindo valores Date e Uint8Array.
- Na primeira visita aos mapas Subway Surfers, o bootstrap tenta importar esse backup antes de iniciar Unity. Se o arquivo estiver indisponível ou inválido, carrega `unlock-all.js` e depois `infinite-save.js`. Se já houver save local, preserva-o; arquivos auxiliares e PlayerPrefs existentes também não são substituídos durante a mesclagem. Um marcador no localStorage impede reaplicar o backup em cada mapa.
- Os jogos agora têm URLs diretas, como `/berlin`, `/winter-holiday`, `/subway-crackers` e `/moggers`. Recarregar ou compartilhar a URL conserva o jogo selecionado; fechar o jogo volta a `/`.
- Subway Crackers e Subway Moggers são classificados como jogos independentes, sem rótulo de mapa Subway Surfers e sem timers. O backup de Subway Surfers não é carregado no Subway Crackers.
- `tests/save-bootstrap.py` confirmou a importação das 12 entradas com banco versão 21, a preservação de save existente e o fallback para os dois scripts na ordem prevista. O teste visual do hub no Chromium selecionou Berlin, mudou a rota para `/berlin` e abriu um único iframe.
- A revisão do carregamento encontrou uma corrida no LiveSplit: o hub podia injetar o script antes de o documento do iframe criar `document.body`, causando `insertAdjacentHTML` em `null`. Agora a injeção aguarda o DOM do iframe. A abertura de Berlin ficou sem erro de JavaScript, com o controlador e os três elementos de timer presentes. `game-routes.py` validou os 27 endereços diretos no Chromium.
