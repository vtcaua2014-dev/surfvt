# SurfVT14 — redesign, identidade e deploy

## Concluído

- Troca do favicon Lovable pelos ícones de marca SurfVT (ICO, PNG 32×32 e Apple Touch Icon), sem alterar o PNG original.
- Atualização de título/descrição e canonical para `https://surfvt14.vercel.app/`.
- Redesign responsivo da home com rota destacada, catálogo em cartões, busca por nome/região, estado vazio acessível, navegação para Comunidade e Sobre.
- Preservação das 27 opções jogáveis, dos cinco temas e idiomas, das variantes Venice, dos perfis/configurações, controles, cronômetros, FPS/SoundCloud e backup P14 de Subway Crackers.
- Consolidação de quatro grupos de WASM idênticos por SHA-256; query strings preservadas; service worker v20 inclui `/maps-shared/`.
- Arquivamento fora de `public/` de 45 cópias WASM duplicadas e 55 manifests pequenos sem referência estática; os arquivos originais foram preservados em `archive/` e nenhum `dataUrl` ativo foi movido.
- `pnpm build` concluído com sucesso.

## Pendente

- Enviar as alterações para `main` e confirmar o deploy de produção no projeto Vercel `surfvt`.
