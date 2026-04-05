# NEXUS — Protocolo Cognitivo

App de treino cognitivo diário com perfis, histórico e comparativo.  
Stack: React + Vite + Supabase + Vercel.

---

## 1. Supabase — criar banco de dados

1. Acesse https://supabase.com e crie um projeto gratuito.
2. Vá em **SQL Editor** e rode o script abaixo:

```sql
-- Perfis
create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pin_hash text not null,
  avatar_color text not null default '#22D3EE',
  created_at timestamptz default now()
);

-- Sessões
create table sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  avg_score integer not null default 0,
  is_full_session boolean not null default true,
  created_at timestamptz default now()
);

-- Exercícios por sessão
create table session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  exercise_id text not null,
  points integer not null default 0,
  label text default '',
  detail text default ''
);

-- Índices para performance
create index on sessions(profile_id);
create index on sessions(profile_id, is_full_session);
create index on session_exercises(session_id);

-- Row Level Security (RLS) — acesso público para app pessoal
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table session_exercises enable row level security;

create policy "public_all" on profiles for all using (true) with check (true);
create policy "public_all" on sessions for all using (true) with check (true);
create policy "public_all" on session_exercises for all using (true) with check (true);
```

3. Vá em **Settings > API** e copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

---

## 4. Deploy na Vercel

### Opção A — via GitHub (recomendado)

1. Suba o projeto para um repositório GitHub.
2. Acesse https://vercel.com e clique em **Add New Project**.
3. Importe o repositório.
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**.

A Vercel detecta automaticamente o Vite e configura o build (`npm run build`, output `dist`).

### Opção B — via CLI

```bash
npm i -g vercel
vercel
# Segue as instruções, adiciona as env vars quando pedido
```

---

## 5. Compartilhar com sua namorada

Após o deploy, a Vercel gera uma URL pública (ex: `nexus-cognitive.vercel.app`).  
Qualquer um com a URL pode criar um perfil e jogar — os dados de todos os perfis ficam no mesmo banco Supabase.

---

## Estrutura do projeto

```
src/
  App.jsx              — roteador principal
  constants.js         — exercícios e cores
  lib/
    supabase.js        — cliente Supabase
    db.js              — todas as operações de banco
  components/
    UI.jsx             — componentes compartilhados (Bar, Sparkline, PinPad...)
  games/
    index.jsx          — 5 jogos (UFOV, Dual N-Back, Simon, Stroop, Breathing)
  screens/
    ProfileSelect.jsx  — seleção/criação de perfil com PIN
    Home.jsx           — tela principal
    Performance.jsx    — estatísticas e gráficos
    Compare.jsx        — comparativo head-to-head
    History.jsx        — histórico de sessões
    Session.jsx        — fluxo intro → jogo → resultado → resumo
```

---

## Exercícios

| Exercício | Domínio | Duração | Base científica |
|---|---|---|---|
| ⚡ Campo Visual | Velocidade de processamento | 65s | UFOV — Estudo ACTIVE (Johns Hopkins) |
| 🧠 Dual N-Back | Memória de trabalho | 90s | Jaeggi et al., Li et al. 2021 |
| 🎯 Simon | Memória sequencial | 120s | - |
| 🎨 Stroop | Controle inibitório | 60s | Stroop, 1935 |
| 🌊 Box Breathing | Atenção focada | 120s | HRV / ANS regulation |
