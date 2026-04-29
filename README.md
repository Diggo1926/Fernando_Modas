# RM Modas — Sistema de Gestão

Sistema de gestão interno para a loja RM Modas (Itabaiana/SE). Cobre caixa, estoque e relatórios.

---

## Pré-requisitos

- Node.js 18+
- Conta no [Railway](https://railway.app) (backend + PostgreSQL)
- Conta no [Cloudinary](https://cloudinary.com) (armazenamento de imagens)
- Conta no [Vercel](https://vercel.com) (frontend)

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL do Railway (com `?sslmode=require`) |
| `PORT` | Porta do servidor (Railway define automaticamente) |
| `NODE_ENV` | `development` ou `production` |
| `API_KEY` | Chave de API interna — gere um UUID longo aleatório |
| `JWT_SECRET` | Secret para assinar tokens JWT |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud no Cloudinary |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary |
| `CORS_ORIGINS` | Domínios permitidos separados por vírgula |

### Frontend (`frontend/.env`)

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend (ex: `https://seu-backend.up.railway.app/api`) |
| `VITE_API_KEY` | Mesma `API_KEY` configurada no backend |

---

## Rodando Localmente

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

O servidor sobe em `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O app sobe em `http://localhost:5173`.

Crie um arquivo `frontend/.env` com:
```
VITE_API_URL=http://localhost:3001/api
VITE_API_KEY=sua_api_key_aqui
```

---

## Deploy no Railway (Backend)

1. Crie um novo projeto no Railway
2. Adicione um serviço **PostgreSQL** — copie a `DATABASE_URL` gerada
3. Adicione um serviço **Node.js** apontando para a pasta `backend/`
4. Configure as variáveis de ambiente listadas acima
5. O `railway.json` já configura o comando de start com migração automática (`prisma migrate deploy`)

### Configurar banco PostgreSQL no Railway

1. Acesse o serviço PostgreSQL no Railway
2. Copie a variável `DATABASE_URL` (inclua `?sslmode=require` ao final)
3. Cole-a na variável de ambiente `DATABASE_URL` do serviço Node.js

---

## Deploy no Vercel (Frontend)

1. Importe o repositório no Vercel, configurando o **Root Directory** como `frontend/`
2. O framework é detectado automaticamente como Vite
3. Adicione as variáveis de ambiente `VITE_API_URL` e `VITE_API_KEY` nas configurações do projeto
4. O `vercel.json` já configura o rewrite para SPA e os headers de segurança

---

## Configurar Cloudinary

1. Crie uma conta em [cloudinary.com](https://cloudinary.com)
2. Acesse **Dashboard** e copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Configure as três variáveis de ambiente no Railway

---

## Estrutura do Projeto

```
rm-modas/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Componentes por módulo
│   │   ├── pages/          # CaixaPage, EstoquePage, RelatorioPage
│   │   ├── hooks/          # useVendas, useEstoque, useRelatorio
│   │   ├── services/       # api.js (axios + API Key)
│   │   └── utils/          # formatters.js
│   └── vercel.json
│
└── backend/                # Node.js + Express + Prisma
    ├── src/
    │   ├── routes/         # caixa.js, estoque.js, relatorio.js
    │   ├── controllers/    # Lógica de negócio
    │   ├── middlewares/    # auth, rateLimiter, errorHandler, upload
    │   ├── prisma/         # schema.prisma
    │   ├── services/       # cloudinary.js, relatorio.js
    │   └── utils/          # logger.js, sanitize.js
    └── railway.json
```
