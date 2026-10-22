# OAuth2 do SurfVT14: Google e Discord

Este projeto já contém o fluxo **Authorization Code** no servidor:

- Google: `/auth/google/start` → `/auth/google/callback`
- Discord: `/auth/discord/start` → `/auth/discord/callback`
- Sessão atual: `/auth/session`

Os segredos ficam somente no servidor, em `.dev.vars`. **Nunca coloque client secret em React, `public/`, GitHub ou mensagem pública.**

## 1. URLs de redirecionamento

A URL precisa ser cadastrada exatamente, incluindo protocolo, porta, caminho e ausência/presença de barra final.

### Teste local

Google:

```text
http://localhost:4173/auth/google/callback
```

Discord:

```text
http://localhost:4173/auth/discord/callback
```

Se você abrir o site usando `127.0.0.1`, cadastre também as versões com `127.0.0.1`:

```text
http://127.0.0.1:4173/auth/google/callback
http://127.0.0.1:4173/auth/discord/callback
```

### URL pública temporária

Se for testar pelo endereço público do sandbox, cadastre os dois caminhos usando o mesmo domínio público:

```text
https://SEU-DOMINIO/auth/google/callback
https://SEU-DOMINIO/auth/discord/callback
```

Não misture `localhost` com o domínio público. O domínio usado para abrir o site deve ser o mesmo domínio usado no callback.

## 2. Criar o cliente Google

1. Abra o [Google Cloud Console](https://console.cloud.google.com/).
2. Selecione ou crie um projeto.
3. Acesse **APIs e serviços → Tela de consentimento OAuth**.
4. Escolha **Externo** para permitir contas Google fora de uma organização.
5. Informe o nome do app e o e-mail de suporte.
6. Em **Usuários de teste**, adicione sua conta Google enquanto o app estiver em teste.
7. Acesse **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**.
8. Escolha **Aplicativo da Web**.
9. Em **URIs de redirecionamento autorizados**, adicione as URLs Google da seção anterior.
10. Copie o **Client ID** e o **Client Secret** apenas para o arquivo local de variáveis.

O SurfVT14 solicita somente `openid email profile`, suficiente para nome, avatar e identificação básica.

## 3. Criar o cliente Discord

1. Abra o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em **New Application** ou abra a aplicação existente.
3. Entre em **OAuth2 → General**.
4. Em **Redirects**, clique em **Add Redirect**.
5. Adicione as URLs Discord da seção anterior exatamente como estão.
6. Salve.
7. Copie o **Client ID** e gere/roteie o **Client Secret** somente no servidor.

O SurfVT14 solicita os escopos mínimos `identify email`. Não é necessário adicionar `bot`, `guilds`, permissões administrativas ou instalar um bot para fazer login.

## 4. Configurar o servidor local

Na raiz do projeto, crie `.dev.vars` — esse arquivo já está protegido pelo `.gitignore`:

```dotenv
# URL pública preferencial; para teste local, deixe comentada.
# SURFVT14_PUBLIC_ORIGIN=https://SEU-DOMINIO

GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret

DISCORD_CLIENT_ID=seu-client-id
DISCORD_CLIENT_SECRET=seu-client-secret
```

Depois inicie com:

```bash
./start-local-oauth.sh
```

Se o servidor já estiver rodando em outra sessão, reinicie-o para carregar as novas variáveis.

## 5. Testar sem expor o segredo

Verifique se a sessão anônima responde:

```bash
curl http://localhost:4173/auth/session
```

Resultado esperado antes do login:

```json
{"authenticated":false}
```

Verifique se os endpoints deixam de responder `503`:

```bash
curl -I http://localhost:4173/auth/google/start
curl -I http://localhost:4173/auth/discord/start
```

O resultado esperado é `302`, com `Location` apontando para o provedor. Não publique nem copie a URL completa se ela contiver dados de teste.

Depois, no navegador:

1. Abra `http://localhost:4173/`.
2. Abra **CONFIGURAÇÕES**.
3. Clique em **Entrar com Google** ou **Entrar com Discord**.
4. Autorize somente os escopos exibidos.
5. Confirme que o nome/avatar aparecem no perfil.
6. Acesse `/auth/session` e confirme `authenticated: true`.

## 6. Problemas comuns

### `redirect_uri_mismatch` no Google

A URL não está cadastrada exatamente no cliente Google. Confira protocolo, porta, domínio e caminho `/auth/google/callback`.

### `Invalid OAuth2 redirect_uri` no Discord

A URL enviada pelo site não é idêntica à URL salva em **OAuth2 → General → Redirects**. Cadastre também a versão `127.0.0.1` se usar esse endereço.

### Endpoint retorna `503`

O processo não carregou `.dev.vars`, o nome de uma variável está errado ou o servidor não foi reiniciado.

### Login funciona no provedor, mas retorna erro de state

O fluxo usa cookie `HttpOnly` de estado para proteção CSRF. Não abra o callback em outra aba/domínio e não bloqueie cookies do site.

### O segredo foi exposto

Revogue/regere o secret no Google Cloud Console ou Discord Developer Portal imediatamente e atualize `.dev.vars`. O client secret antigo não deve ser reutilizado.

## 7. Checklist de produção

- [ ] Usar HTTPS.
- [ ] Cadastrar apenas os domínios reais de produção.
- [ ] Definir `SURFVT14_PUBLIC_ORIGIN` para o domínio canônico.
- [ ] Guardar secrets em variáveis do provedor de hospedagem, nunca no código.
- [ ] Manter somente os escopos `openid email profile` e `identify email`.
- [ ] Revogar secrets que tenham sido compartilhados ou commitados.
- [ ] Testar Google e Discord em uma janela anônima.
