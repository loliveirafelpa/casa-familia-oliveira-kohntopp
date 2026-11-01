-- Finanças da casa: controle mensal (contas, entradas, lançamentos do dia a dia, divisão com a Larissa).
-- Origem: pacote "financas-casa-docs" (página "Contas da Casa", versão 7), adaptado a este app:
--   * acesso só para aparelhos que digitaram o CÓDIGO DE FINANÇAS (membros_casa.ve_financas),
--     além do código da casa — quem só tem o código da casa não recebe nada destas tabelas;
--   * casa_id em todas as tabelas, preenchido pelo banco (private.minha_casa_id()), e RLS no padrão do app;
--   * criar mês sem erro quando dois celulares abrem o mesmo mês juntos.
-- Grupos e categorias ficam no código (src/data/financas.js), sem trava no banco.

-- ---------------------------------------------------------------------------
-- Código de finanças
-- ---------------------------------------------------------------------------
alter table public.casas add column codigo_financas_hash text;
alter table public.membros_casa add column ve_financas boolean not null default false;

-- O aparelho (já membro) informa o código de finanças. Acertou: passa a ver as finanças. Devolve true/false.
-- Usa o mesmo limite de tentativas do código da casa (10 erros por hora, somados).
create function public.liberar_financas(codigo text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_casa uuid;
  v_ve boolean;
begin
  select casa_id, ve_financas into v_casa, v_ve from public.membros_casa where user_id = v_uid limit 1;
  if v_casa is null then
    return false;
  end if;
  if v_ve then
    return true;
  end if;
  if coalesce(trim(codigo), '') = '' then
    return false;
  end if;

  if (select count(*) from private.tentativas_codigo where user_id = v_uid and em > now() - interval '1 hour') >= 10 then
    raise exception 'muitas tentativas' using errcode = 'P0001', hint = 'Espere uma hora e tente de novo.';
  end if;

  if not exists (
    select 1 from public.casas
    where id = v_casa and codigo_financas_hash is not null
      and codigo_financas_hash = extensions.crypt(codigo, codigo_financas_hash)
  ) then
    insert into private.tentativas_codigo (user_id) values (v_uid);
    return false;
  end if;

  update public.membros_casa set ve_financas = true where casa_id = v_casa and user_id = v_uid;
  return true;
end;
$$;
revoke all on function public.liberar_financas(text) from public, anon;
grant execute on function public.liberar_financas(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- Um registro por casa e mês (mes = sempre o dia 1).
create table public.fin_meses (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  mes date not null check (extract(day from mes) = 1),
  saldo_inicial numeric(12,2),
  nota text not null default '' check (length(nota) <= 5000),
  divisao_ativa boolean not null default false, -- a Larissa ajuda neste mês
  divisao_recebido numeric(12,2) check (divisao_recebido is null or divisao_recebido >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (casa_id, mes),
  unique (id, casa_id)
);

-- Saídas do mês: contas fixas, faturas de cartão, mercado.
create table public.fin_contas (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id(),
  mes_id uuid not null,
  nome text not null check (length(trim(nome)) between 1 and 100),
  grupo text not null default 'Outros' check (length(grupo) between 1 and 50),
  previsto numeric(12,2),
  realizado numeric(12,2),
  pago boolean not null default false,
  e_cartao boolean not null default false, -- fatura de cartão: recebe os lançamentos feitos nele
  e_mercado boolean not null default false, -- linha "Mercado": recebe o mercado pago fora do cartão
  entra_divisao boolean not null default false, -- entra na metade da Larissa
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (mes_id, casa_id) references public.fin_meses (id, casa_id) on delete cascade,
  unique (mes_id, id),
  check (not (e_cartao and e_mercado))
);
create unique index fin_contas_um_mercado_por_mes on public.fin_contas (mes_id) where e_mercado;
create index fin_contas_casa_id_idx on public.fin_contas (casa_id);
create index fin_contas_mes_casa_idx on public.fin_contas (mes_id, casa_id);

create table public.fin_entradas (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id(),
  mes_id uuid not null,
  nome text not null check (length(trim(nome)) between 1 and 100),
  previsto numeric(12,2),
  recebido numeric(12,2),
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (mes_id, casa_id) references public.fin_meses (id, casa_id) on delete cascade
);
create index fin_entradas_casa_id_idx on public.fin_entradas (casa_id);
create index fin_entradas_mes_casa_idx on public.fin_entradas (mes_id, casa_id);

-- Gastos do dia a dia. No cartão, aponta para a fatura daquele cartão NO MESMO MÊS; se a fatura for apagada,
-- o gasto perde o vínculo e passa a contar como avulso.
create table public.fin_lancamentos (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id(),
  mes_id uuid not null,
  data date not null,
  descricao text not null check (length(trim(descricao)) between 1 and 200),
  categoria text not null check (length(categoria) between 1 and 50),
  forma text not null check (forma in ('cartao', 'pix_debito', 'dinheiro')),
  conta_cartao_id uuid,
  valor numeric(12,2) not null check (valor > 0),
  criado_por uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (mes_id, casa_id) references public.fin_meses (id, casa_id) on delete cascade,
  foreign key (mes_id, conta_cartao_id) references public.fin_contas (mes_id, id) on delete set null (conta_cartao_id),
  check (forma = 'cartao' or conta_cartao_id is null)
);
create index fin_lancamentos_casa_id_idx on public.fin_lancamentos (casa_id);
create index fin_lancamentos_mes_data_idx on public.fin_lancamentos (mes_id, data desc);
create index fin_lancamentos_mes_casa_idx on public.fin_lancamentos (mes_id, casa_id);
create index fin_lancamentos_cartao_idx on public.fin_lancamentos (mes_id, conta_cartao_id);
create index fin_lancamentos_criado_por_idx on public.fin_lancamentos (criado_por);

-- Modelo para meses novos.
create table public.fin_orcamento_padrao (
  id uuid primary key default gen_random_uuid(),
  casa_id uuid not null default private.minha_casa_id() references public.casas (id) on delete cascade,
  tipo text not null check (tipo in ('conta', 'entrada')),
  nome text not null check (length(trim(nome)) between 1 and 100),
  grupo text,
  previsto numeric(12,2),
  e_cartao boolean not null default false,
  e_mercado boolean not null default false,
  entra_divisao boolean not null default false,
  ordem int not null default 0
);
create index fin_orcamento_padrao_casa_id_idx on public.fin_orcamento_padrao (casa_id);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------
create function private.fin_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger fin_meses_upd before update on public.fin_meses for each row execute function private.fin_updated_at();
create trigger fin_contas_upd before update on public.fin_contas for each row execute function private.fin_updated_at();
create trigger fin_entradas_upd before update on public.fin_entradas for each row execute function private.fin_updated_at();
create trigger fin_lancamentos_upd before update on public.fin_lancamentos for each row execute function private.fin_updated_at();

-- Preencher o realizado marca a conta como paga.
create function private.fin_contas_pago_auto()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.realizado is not null and (tg_op = 'INSERT' or old.realizado is distinct from new.realizado) then
    new.pago = true;
  end if;
  return new;
end;
$$;
create trigger fin_contas_pago before insert or update on public.fin_contas
  for each row execute function private.fin_contas_pago_auto();

-- ---------------------------------------------------------------------------
-- RLS: só membros da casa que digitaram o código de finanças
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['fin_meses', 'fin_contas', 'fin_entradas', 'fin_lancamentos', 'fin_orcamento_padrao'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$
      create policy "membro com código de finanças mexe nas finanças da casa" on public.%I
        for all to authenticated
        using (casa_id in (select casa_id from public.membros_casa where user_id = (select auth.uid()) and ve_financas))
        with check (casa_id in (select casa_id from public.membros_casa where user_id = (select auth.uid()) and ve_financas))
    $p$, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Funções
-- ---------------------------------------------------------------------------

-- Abre um mês (qualquer dia dele) a partir do orçamento padrão. Se já existe, só devolve o id.
-- Roda com as permissões de quem chama (RLS vale).
create function public.fin_criar_mes(p_mes date)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_mes date := date_trunc('month', p_mes)::date;
  v_id uuid;
begin
  insert into public.fin_meses (mes) values (v_mes)
  on conflict (casa_id, mes) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.fin_meses where mes = v_mes;
    return v_id;
  end if;

  insert into public.fin_contas (mes_id, nome, grupo, previsto, e_cartao, e_mercado, entra_divisao, ordem)
  select v_id, nome, coalesce(grupo, 'Outros'), previsto, e_cartao, e_mercado, entra_divisao, ordem
  from public.fin_orcamento_padrao where tipo = 'conta';

  insert into public.fin_entradas (mes_id, nome, previsto, ordem)
  select v_id, nome, previsto, ordem
  from public.fin_orcamento_padrao where tipo = 'entrada';

  return v_id;
end;
$$;
revoke all on function public.fin_criar_mes(date) from public, anon;
grant execute on function public.fin_criar_mes(date) to authenticated;

-- "Usar este mês como orçamento padrão": troca o padrão inteiro de uma vez
-- (previsto de cada linha; se não houver, o realizado/recebido).
create function public.fin_salvar_padrao(p_mes_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.fin_meses where id = p_mes_id) then
    raise exception 'mês não encontrado';
  end if;

  delete from public.fin_orcamento_padrao where casa_id = (select casa_id from public.fin_meses where id = p_mes_id);

  insert into public.fin_orcamento_padrao (tipo, nome, grupo, previsto, e_cartao, e_mercado, entra_divisao, ordem)
  select 'conta', nome, grupo, coalesce(previsto, realizado), e_cartao, e_mercado, entra_divisao, ordem
  from public.fin_contas where mes_id = p_mes_id;

  insert into public.fin_orcamento_padrao (tipo, nome, previsto, ordem)
  select 'entrada', nome, coalesce(previsto, recebido), ordem
  from public.fin_entradas where mes_id = p_mes_id;
end;
$$;
revoke all on function public.fin_salvar_padrao(uuid) from public, anon;
grant execute on function public.fin_salvar_padrao(uuid) to authenticated;

-- Avisos ao vivo para os outros celulares (respeitam o RLS acima).
alter publication supabase_realtime add table
  public.fin_meses, public.fin_contas, public.fin_entradas, public.fin_lancamentos, public.fin_orcamento_padrao;

-- ---------------------------------------------------------------------------
-- Orçamento padrão atual (novembro/2026). Os três cartões estão sem previsto.
-- ---------------------------------------------------------------------------
insert into public.fin_orcamento_padrao (casa_id, tipo, nome, grupo, previsto, e_cartao, e_mercado, entra_divisao, ordem)
select c.id, v.tipo, v.nome, v.grupo, v.previsto, v.e_cartao, v.e_mercado, v.entra_divisao, v.ordem
from (select id from public.casas order by created_at limit 1) c,
(values
  ('entrada', 'Salário (líquido)',    null,        25000.00, false, false, false,  0),
  ('conta',   'Financiamento apto',   'Moradia',    3921.22, false, false, true,   1),
  ('conta',   'Condomínio',           'Moradia',     780.00, false, false, true,   2),
  ('conta',   'Luz',                  'Moradia',     370.00, false, false, true,   3),
  ('conta',   'IPTU',                 'Moradia',     149.28, false, false, true,   4),
  ('conta',   'Claro',                'Moradia',      99.90, false, false, true,   5),
  ('conta',   'Financiamento studio', 'Studio',     3500.00, false, false, false,  6),
  ('conta',   'Condomínio studio',    'Studio',      573.00, false, false, true,   7),
  ('conta',   'Luz studio',           'Studio',       65.00, false, false, true,   8),
  ('conta',   'Claro studio',         'Studio',       98.00, false, false, false,  9),
  ('conta',   'Cartão Itaú',          'Dia a dia',     null, true,  false, false, 10),
  ('conta',   'Cartão Sicredi',       'Dia a dia',     null, true,  false, false, 11),
  ('conta',   'Cartão BB',            'Dia a dia',     null, true,  false, false, 12),
  ('conta',   'Mercado',              'Dia a dia',  2500.00, false, true,  false, 13)
) as v(tipo, nome, grupo, previsto, e_cartao, e_mercado, entra_divisao, ordem);
