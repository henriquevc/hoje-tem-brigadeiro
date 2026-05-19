# Hoje tem brigadeiro

Sistema para gerenciar vendas de brigadeiro: cadastro de produtos (caixas), registro de vendas com lucro automático e painel com gráficos.

## Stack

- Vue 3 + TypeScript + Vite
- [shadcn-vue](https://www.shadcn-vue.com/) (Tailwind CSS v4)
- **IndexedDB** (Dexie) — funciona imediatamente, sem conta
- **Supabase** (PostgreSQL) — opcional, para nuvem e deploy

## Começar

```bash
cd hoje-tem-brigadeiro
npm install
npm run dev
```

Abra http://localhost:5173

Na primeira execução, quatro produtos de exemplo são criados (como na sua planilha).

## Funcionalidades

| Tela | Descrição |
|------|-----------|
| **Vendas** (início) | Listagem por data, cards do dia/mês/geral, lucro, gráficos de receita no mês e mais vendidos |
| **Produtos** | CRUD de caixas com valor de venda e preço de custo |

Ao registrar uma venda, **preço de custo e valor de venda** são copiados da tabela de produtos. O **lucro** é `(valor_venda - preco_custo) × quantidade`.

## Banco de dados (Supabase — gratuito)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano free).
2. No SQL Editor, execute o arquivo `supabase/schema.sql`.
3. Copie URL e `anon key` em **Project Settings → API**.
4. Crie `.env` a partir de `.env.example`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. Reinicie `npm run dev`. O badge no topo mostrará **Supabase**.

Sem `.env`, os dados ficam no **IndexedDB** do navegador (badge **IndexedDB**).

## Publicar grátis

### Frontend (Vercel ou Netlify)

1. Envie o repositório para o GitHub.
2. Em [vercel.com](https://vercel.com) ou [netlify.com](https://netlify.com), importe o projeto.
3. Build: `npm run build` · Output: `dist`
4. Adicione as variáveis `VITE_SUPABASE_*` no painel do host (recomendado para não perder dados ao trocar de dispositivo).

O arquivo `vercel.json` já configura SPA fallback.

### Alternativa só local

Use sem Supabase: os dados persistem no navegador de cada máquina.

## Scripts

| Comando | Ação |
|---------|------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |

## Estrutura

```
src/
  views/          Home (vendas + dashboard), Produtos
  components/     UI shadcn, gráficos, formulários
  lib/repository  Camada de dados (Dexie ou Supabase)
  stores/         Pinia
  composables/    Métricas do dashboard
```
