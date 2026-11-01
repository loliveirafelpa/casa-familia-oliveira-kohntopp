-- Entrada sem login: cada aparelho entra no Supabase como usuário anônimo (sem e-mail, sem senha) e,
-- na primeira vez, informa a palavra-código da casa. Acertou, vira membro e nunca mais vê essa tela.
-- Troca os convites por e-mail da migração anterior. O RLS por casa continua igual.

drop function public.entrar_na_casa();
drop table public.convites;

-- Só o hash do código fica guardado (bcrypt). Definir/trocar pelo SQL Editor — ver README.
alter table public.casas add column codigo_hash text;

-- Códigos errados por aparelho, para limitar tentativas (10 por hora). Fora da API (schema private).
create table private.tentativas_codigo (
  user_id uuid not null,
  em timestamptz not null default now()
);
create index tentativas_codigo_user_em_idx on private.tentativas_codigo (user_id, em);

-- Devolve a casa de quem chamou. Se ainda não é membro e o código confere, vira membro.
-- O app manda o código já normalizado (minúsculas, sem acentos, espaços simples).
create function public.entrar_na_casa(codigo text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_casa uuid;
begin
  if v_uid is null then
    return null;
  end if;

  select casa_id into v_casa from public.membros_casa where user_id = v_uid limit 1;
  if v_casa is not null or coalesce(trim(codigo), '') = '' then
    return v_casa;
  end if;

  if (select count(*) from private.tentativas_codigo where user_id = v_uid and em > now() - interval '1 hour') >= 10 then
    raise exception 'muitas tentativas' using errcode = 'P0001', hint = 'Espere uma hora e tente de novo.';
  end if;

  select id into v_casa from public.casas
  where codigo_hash is not null and codigo_hash = extensions.crypt(codigo, codigo_hash)
  limit 1;

  if v_casa is null then
    insert into private.tentativas_codigo (user_id) values (v_uid);
    return null;
  end if;

  insert into public.membros_casa (casa_id, user_id) values (v_casa, v_uid) on conflict do nothing;
  return v_casa;
end;
$$;
revoke all on function public.entrar_na_casa(text) from public, anon;
grant execute on function public.entrar_na_casa(text) to authenticated;
