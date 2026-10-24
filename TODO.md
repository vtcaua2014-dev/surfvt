# SurfVT14 — interface Alpha/Beta

## Concluído — redesign anterior do site e deploy

- Troca do favicon Lovable pelos ícones de marca SurfVT (ICO, PNG 32×32 e Apple Touch Icon), sem alterar o PNG original.
- Atualização de título/descrição e canonical para `https://surfvt14.vercel.app/`.
- Redesign responsivo da Alpha com rota destacada, catálogo em cartões, busca por nome/região, estado vazio acessível, navegação para Comunidade e Sobre.
- Preservação das 27 opções jogáveis, dos cinco temas e idiomas, das variantes Venice, dos perfis/configurações, controles, cronômetros, FPS/SoundCloud e backup P14 de Subway Crackers.
- Consolidação de quatro grupos de WASM idênticos por SHA-256; query strings preservadas; service worker v20 inclui `/maps-shared/`.
- Arquivamento fora de `public/` de 45 cópias WASM duplicadas e 55 manifests pequenos sem referência estática; os arquivos originais foram preservados em `archive/` e nenhum `dataUrl` ativo foi movido.
- O deploy de produção Vercel do commit `0aba92e8495bb1176e87b681bf086785393132c9` está `READY`.

## Interface Alpha/Beta — em andamento

- Remover do cabeçalho os botões de temas ao lado de NETOS e substituí-los pelos dois rótulos exatos “Alpha SurfVT” e “Beta SurfVT”. Alpha preserva a interface atual; Beta usa o HTML fornecido como referência e deve ser aprimorada para o SurfVT real.
- Exibir os 27 cartões de builds. Cada cartão deve ter a imagem/tutorial correspondente ao seu mapa; reutilizar as miniaturas já associadas às 27 opções no site atual, incluindo as imagens específicas de Subway Crackers e Subway Moggers. O site abriu sem solicitar data de nascimento.
- Ligar pesquisa, filtros, seleção e lançamento aos dados e callbacks reais das builds. Não apresentar botões demonstrativos que não carreguem uma build existente.
- Manter Configurações acessíveis em Alpha e Beta; remover do cabeçalho somente os temas e disponibilizar ali, no painel Configurações, os cinco temas existentes.
- Preservar os idiomas, os perfis/autenticação, as variantes Venice, controles, cronômetros, FPS/SoundCloud, opções de jogo, avisos e backup P14; manter âncoras de Comunidade/Sobre e layout utilizável em desktop e celular.
- Persistir a escolha Alpha/Beta no navegador sem alterar builds Unity ou saves.
