# Conta em Dia — Web

Frontend do Conta em Dia: React 19 + Vite + Tailwind v4, autenticado com Firebase Auth (Google) e dados no Firestore. As regras de segurança e a config do projeto Firebase ficam no repo [conta-em-dia](https://github.com/klausterra/conta-em-dia).

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencha com a config do app web do Firebase
npm run dev
```

## Build

```bash
npm run build   # gera ./dist
```

## Deploy no Cloudflare Pages

1. Conecte este repositório no Cloudflare Pages.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Variáveis de ambiente (Settings → Environment variables), iguais às do `.env.local`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Depois do primeiro deploy, adicione o domínio do Cloudflare Pages (ex.: `conta-em-dia-web.pages.dev` e o domínio customizado, se houver) em **Firebase Console → Authentication → Settings → Authorized domains**, senão o login com Google é bloqueado.

## Dados

Cada usuário autenticado tem suas contas em `users/{uid}/bills/{billId}` no Firestore. As regras de segurança (`firestore.rules`, no outro repo) só permitem que um usuário leia/escreva os próprios documentos.
