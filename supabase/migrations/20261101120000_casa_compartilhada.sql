-- Casa em dia: dados compartilhados por todos os membros da casa (antes ficavam só no localStorage de cada aparelho).
-- Quem entra: só quem tem o e-mail em `convites`. Ao entrar pela primeira vez, `entrar_na_casa()` liga a pessoa à casa.
-- RLS por casa, não por usuário: cada membro vê e altera tudo da própria casa.

-- ---------------------------------------------------------------------------
-- Casa, membros e convites
-- ---------------------------------------------------------------------------
create table public.casas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table public.membros_casa (
  casa_id uuid not null references public.casas (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (casa_id, user_id)
);
create index membros_casa_user_id_idx on public.membros_casa (user_id);

-- E-mails autorizados a entrar (sempre em minúsculas). Só o painel/SQL mexe aqui: sem policy, o app não lê nem grava.
create table public.convites (
  email text primary key check (email = lower(email)),
  casa_id uuid not null references public.casas (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index convites_casa_id_idx on public.convites (casa_id);

alter table public.casas enable row level security;
alter table public.membros_casa enable row level security;
alter table public.convites enable row level security;

create policy "membro vê a própria casa" on public.casas
  for select to authenticated
  using (id in (select casa_id from public.membros_casa where user_id = (select auth.uid())));

create policy "membro vê os membros da própria casa" on public.membros_casa
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Casa de quem está logado. Usada como valor padrão de casa_id, para o app não precisar mandar.
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.minha_casa_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select casa_id from public.membros_casa where user_id = (select auth.uid()) limit 1
$$;
revoke all on function private.minha_casa_id() from public;
grant execute on function private.minha_casa_id() to authenticated;

-- Chamada logo depois do login: se a pessoa ainda não é membro e o e-mail dela foi convidado, vira membro.
-- Devolve a casa (ou null, se o e-mail não está na lista).
create function public.entrar_na_casa()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_casa uuid;
begin
  if (select auth.uid()) is null then
    return null;
  end if;

  select casa_id into v_casa from public.membros_casa where user_id = (select auth.uid()) limit 1;
  if v_casa is not null then
    return v_casa;
  end if;

  select casa_id into v_casa from public.convites where email = lower((select auth.jwt()) ->> 'email');
  if v_casa is null then
    return null;
  end if;

  insert into public.membros_casa (casa_id, user_id) values (v_casa, (select auth.uid()))
  on conflict do nothing;
  return v_casa;
end;
$$;
revoke all on function public.entrar_na_casa() from public, anon;
grant execute on function public.entrar_na_casa() to authenticated;

-- ---------------------------------------------------------------------------
-- Dados da casa
-- ---------------------------------------------------------------------------

-- Tarefas feitas (do plano ou avulsas). tarefa_id = id em src/data/plano.js ou 'avulsa-…'.
create table public.conclusoes (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  data date not null,
  tarefa_id text not null,
  concluida_por uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (casa_id, data, tarefa_id)
);
create index conclusoes_concluida_por_idx on public.conclusoes (concluida_por);

-- Tarefas que só valem num dia. id começa com 'avulsa-' (gerado no app), para casar com conclusoes.tarefa_id.
create table public.tarefas_avulsas (
  id text primary key check (id like 'avulsa-%'),
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  data date not null,
  titulo text not null check (length(titulo) between 1 and 200),
  created_at timestamptz not null default now()
);
create index tarefas_avulsas_casa_data_idx on public.tarefas_avulsas (casa_id, data);

-- Coisas a fazer, sem data. feito_em null = pendente.
create table public.afazeres (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  titulo text not null check (length(titulo) between 1 and 200),
  observacao text not null default '' check (length(observacao) <= 500),
  created_at timestamptz not null default now(),
  feito_em timestamptz
);
create index afazeres_casa_id_idx on public.afazeres (casa_id);

-- Lista de compras. id = id do catálogo (src/data/catalogo.js) ou uuid de item adicionado à mão.
create table public.itens_compra (
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  id text not null,
  nome text not null check (length(nome) between 1 and 100),
  secao text not null,
  estado text not null default 'casa' check (estado in ('casa', 'falta', 'carrinho')),
  quantidade int not null default 1 check (quantidade between 1 and 99),
  observacao text not null default '' check (length(observacao) <= 300),
  updated_at timestamptz not null default now(),
  primary key (casa_id, id)
);

-- Itens do catálogo que a família apagou pelo app: não voltam quando o catálogo é sincronizado.
create table public.itens_apagados (
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  item_id text not null,
  primary key (casa_id, item_id)
);

-- Mesma regra em todas: cada membro lê e altera só o que é da própria casa.
do $$
declare
  t text;
begin
  foreach t in array array['conclusoes', 'tarefas_avulsas', 'afazeres', 'itens_compra', 'itens_apagados'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy "membro mexe nos dados da própria casa" on public.%I
        for all to authenticated
        using (casa_id in (select casa_id from public.membros_casa where user_id = (select auth.uid())))
        with check (casa_id in (select casa_id from public.membros_casa where user_id = (select auth.uid())))
    $p$, t);
  end loop;
end;
$$;

-- Avisos ao vivo: quando alguém mexe num celular, os outros recarregam a tela (respeita o RLS acima).
alter publication supabase_realtime add table
  public.conclusoes, public.tarefas_avulsas, public.afazeres, public.itens_compra, public.itens_apagados;

-- A casa da família. Os e-mails dos membros entram em `convites` à parte (ver README).
insert into public.casas (nome) values ('Família Oliveira Kohntopp');
