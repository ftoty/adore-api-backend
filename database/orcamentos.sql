create extension if not exists "pgcrypto";

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  empresa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  nome text,
  email text,
  telefone text,
  itens jsonb not null default '[]'::jsonb,
  observacoes text,
  total numeric(12,2) not null default 0,
  documento jsonb,
  documento_nome text,
  enviado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orcamentos_created_at_idx on public.orcamentos (created_at desc);
create index if not exists clientes_nome_idx on public.clientes (nome);
