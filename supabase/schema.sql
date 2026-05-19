-- Execute no SQL Editor do Supabase (https://supabase.com)

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor_venda numeric(10, 2) not null check (valor_venda >= 0),
  preco_custo numeric(10, 2) not null check (preco_custo >= 0),
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  quantidade integer not null check (quantidade > 0),
  produto_id uuid not null references products(id) on delete restrict,
  produto_nome text not null,
  valor_venda numeric(10, 2) not null,
  preco_custo numeric(10, 2) not null,
  lucro numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists sales_data_idx on sales (data desc);

alter table products enable row level security;
alter table sales enable row level security;

-- Acesso público (ajuste políticas se adicionar autenticação depois)
create policy "products_all" on products for all using (true) with check (true);
create policy "sales_all" on sales for all using (true) with check (true);
