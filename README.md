# Desafio Hubfy – Gestão de Tarefas

Aplicação full‑stack para gestão de tarefas com autenticação JWT, dashboard em Next.js e banco MySQL via Prisma.

---

## Tecnologias

**Frontend**

- Next.js 16 (App Router) + React 19
- MUI (`@mui/material`, `@mui/icons-material`)
- MUI X Charts – PieChart para status das tarefas [attached_file:1]
- React Hook Form + Zod (validação de formulários)
- Tailwind CSS 4 (utilitários de estilo)

**Backend**

- Next.js API Routes
- MySQL (em container Docker)
- Prisma ORM (`@prisma/client`, `prisma`)
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs` para hash de senhas
- `dotenv` para variáveis de ambiente

**Testes e qualidade**

- Jest + Supertest (testes de API)
- ts-jest (Jest + TypeScript)
- ESLint + eslint-config-next
- TypeScript

---

## Pré‑requisitos

- Node.js (LTS)
- npm ou yarn
- Docker (com suporte a MySQL)

---

## Configuração do ambiente

### 1. Clonar o repositório

git clone https://github.com/vinicesar/desafio-hubfy

cd ~/seuCaminho/desafio-hubfy

depois rode npm install

### 2. Variáveis de ambiente

Na raiz do projeto existe um `env.example`.

Edite o `.env` com:

- `DATABASE_URL` apontando para seu MySQL (ex.: `mysql://usuario:senha@localhost:3306/desafio_hubfy`)
- `JWT_SECRET` e `JWT_EXPIRES_IN` (ex.: `1h`)

---

## Banco de dados (MySQL + Docker)

### Subir o MySQL

Exemplo com Docker:

docker run --name desafio_hubfy_db -e MYSQL_ROOT_PASSWORD=senha
-e MYSQL_DATABASE=desafio_hubfy
-p 3306:3306 -d mysql:8
