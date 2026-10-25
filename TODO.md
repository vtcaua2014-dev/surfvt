# SurfVT14 — interface Alpha/Beta, Configurações e loader

## Concluído — redesign e deploy base
- Troca do favicon Lovable pelos ícones de marca SurfVT (ICO, PNG 32×32 e Apple Touch Icon), sem alterar o PNG original.
- Atualização de título/descrição e canonical para `https://surfvt14.vercel.app/`.
- Redesign responsivo da Alpha com rota destacada, catálogo em cartões, busca por nome/região, estado vazio acessível e navegação para Comunidade/Sobre.
- Preservação das 27 opções jogáveis, dos cinco temas e idiomas, variantes Venice, perfis/configurações, controles, cronômetros, FPS/SoundCloud e backup P14 de Subway Crackers.
- Consolidação de quatro grupos de WASM idênticos por SHA-256, preservando query strings; service worker v20 inclui `/maps-shared/`.
- Arquivamento fora de `public/` de 45 cópias WASM duplicadas e 55 manifests sem referência estática; os arquivos foram preservados em `archive/` e nenhum `dataUrl` ativo foi movido.
- Deploy de produção Vercel do redesign base confirmado `READY`.

## Concluído — interface Alpha/Beta
- Remoção dos botões de temas ao lado de NETOS e uso dos rótulos exatos “Alpha SurfVT” e “Beta SurfVT”. Alpha mantém a interface anterior; Beta usa o HTML fornecido como referência e foi adaptada ao SurfVT real.
- Exibição das 27 opções de builds com as miniaturas já associadas no site, incluindo imagens específicas de Subway Crackers e Subway Moggers; a página não solicita data de nascimento.
- Busca, filtros, seleção e lançamento ligados aos dados e callbacks reais, sem botões demonstrativos para builds inexistentes.
- Builds e Configurações acessíveis; os cinco temas ficam no painel Configurações.
- Preservação dos idiomas, perfis/autenticação, variantes Venice, controles, cronômetros, FPS/SoundCloud, opções de jogo, avisos, backup P14 e âncoras de Comunidade/Sobre, em desktop e celular.
- Escolha Alpha/Beta persistida no navegador, sem alterar builds Unity ou saves.

## Concluído — Configurações e loader
- Menu Configurações com visual Beta, mantendo perfil local/sincronizado, login Google/Discord, temas, idioma, resolução, volume, FPS, saturação, cronômetro, fonte/tamanho, WASD/controles de PC, tamanho/posição dos controles, hoverboard, autoboost, hotkey, SoundCloud e preferências persistidas.
- Loader compartilhado sem a faixa “BUILD LOCAL · SURFVT14 · arquivos ficam no cache após o primeiro download”; mapa/estado/progresso continuam centralizados e a pequena área à direita mostra “SURFVT14” e o botão de saída.
- Deploy de produção Vercel do commit `be72c35513b45fb9685f824a79db5be00078a5dc` confirmado `READY`.
- OAuth Google e Discord mantido nas rotas `/auth/google/callback` e `/auth/discord/callback`; segredos devem ficar em variáveis de ambiente, nunca no código ou no GitHub.
