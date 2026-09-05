# Conta em Dia — Android (TWA)

Trusted Web Activity gerado com [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap), apontando para a PWA em produção:

`https://conta-em-dia-web.pages.dev`

- **Package:** `br.com.contaemdia.app`
- **Versão:** ver `twa-manifest.json` (`appVersion` / `appVersionCode`)

## Pré-requisitos

- Node 20+
- JDK 17+ **sem espaços no path** (no Windows, use junction ex.: `C:\jdk-17` → Temurin 17; Bubblewrap quebra com `Program Files`)
- Android SDK (`ANDROID_HOME` / `ANDROID_SDK_ROOT`)
- Layout legado: pasta `bin` (ou `tools`) na raiz do SDK — se faltar, crie junction `Sdk\bin` → `Sdk\cmdline-tools\latest\bin`
- `@bubblewrap/cli`

Config global do Bubblewrap em `~/.bubblewrap/config.json`:

```json
{
  "jdkPath": "C:\\Program Files\\Android\\Android Studio\\jbr",
  "androidSdkPath": "C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk"
}
```

## Keystore (não versionado)

Arquivos locais (gitignored):

- `android.keystore` — chave de upload
- `.keystore-credentials.local` — senhas

**Faça backup seguro desses dois arquivos.** Sem eles não dá para atualizar o app na Play Store com a mesma chave de upload.

## Build

```powershell
cd android
$creds = Get-Content .keystore-credentials.local | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') { Set-Item -Path "env:$($matches[1])" -Value $matches[2] }
}
$env:BUBBLEWRAP_KEYSTORE_PASSWORD = $env:KEYSTORE_PASSWORD
$env:BUBBLEWRAP_KEY_PASSWORD = $env:KEY_PASSWORD

npx --yes @bubblewrap/cli update --skipVersionUpgrade
npx --yes @bubblewrap/cli build
```

Artefatos:

- `app-release-bundle.aab` — enviar à Play Console
- `app-release-signed.apk` — teste local / sideload

## Digital Asset Links

O arquivo publicado no site:

`https://conta-em-dia-web.pages.dev/.well-known/assetlinks.json`

deve incluir o SHA-256 da **chave de upload** e, após ativar Play App Signing, também o SHA-256 do certificado da Google Play (Console → App signing).

Validar:

https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://conta-em-dia-web.pages.dev&relation=delegate_permission/common.handle_all_urls

## Play Console (resumo)

1. Criar app → nome **Conta em Dia** → app gratuito / categoria Finanças
2. Preencher ficha da loja, política de privacidade, classificação de conteúdo
3. Produção / teste interno → criar release → upload do `.aab`
4. Após o primeiro upload com Play App Signing, copiar o fingerprint da Play e acrescentar em `public/.well-known/assetlinks.json`, redeploy do site
5. Enviar para revisão

## Bump de versão

Edite `appVersion` e `appVersionCode` em `twa-manifest.json`, rode `update --skipVersionUpgrade` + `build` de novo.
