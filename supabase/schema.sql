-- Execute no SQL Editor do Supabase (https://supabase.com)

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor_venda numeric(10, 2) not null check (valor_venda >= 0),
  preco_custo numeric(10, 2) not null check (preco_custo >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apartamento text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  quantidade integer not null check (quantidade > 0),
  produto_id uuid not null references products(id) on delete restrict,
  produto_nome text not null,
  cliente_id uuid references clients(id) on delete restrict,
  cliente_nome text,
  valor_venda numeric(10, 2) not null,
  preco_custo numeric(10, 2) not null,
  lucro numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- Migração caso as tabelas já existam:
-- alter table products add column if not exists ativo boolean not null default true;
-- alter table sales add column if not exists cliente_id uuid references clients(id) on delete restrict;
-- alter table sales add column if not exists cliente_nome text;

create index if not exists sales_data_idx on sales (data desc);
create index if not exists sales_cliente_idx on sales (cliente_id);

alter table products enable row level security;
alter table clients enable row level security;
alter table sales enable row level security;

-- Acesso público (ajuste políticas se adicionar autenticação depois)
create policy "products_all" on products for all using (true) with check (true);
create policy "clients_all" on clients for all using (true) with check (true);
create policy "sales_all" on sales for all using (true) with check (true);

-- Tabelas da calculadora de custos / despensa
create table if not exists pantry_ingredients (
  id text primary key,
  nome text not null,
  preco numeric(10, 2) not null check (preco >= 0),
  quantidade numeric(10, 2) not null check (quantidade >= 0),
  unidade text not null,
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id text primary key,
  nome text not null,
  rendimento integer not null check (rendimento > 0),
  ingredientes jsonb not null,
  created_at timestamptz not null default now()
);

alter table pantry_ingredients enable row level security;
alter table recipes enable row level security;

create policy "pantry_ingredients_all" on pantry_ingredients for all using (true) with check (true);
create policy "recipes_all" on recipes for all using (true) with check (true);
