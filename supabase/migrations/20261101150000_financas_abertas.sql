-- Finanças abertas a todos os membros da casa (decisão da família em 01/11/2026): sai o código de finanças.
-- O RLS volta ao padrão das outras tabelas — quem entrou com o código da casa vê e altera as finanças.

drop function public.liberar_financas(text);

do $$
declare
  t text;
begin
  foreach t in array array['fin_meses', 'fin_contas', 'fin_entradas', 'fin_lancamentos', 'fin_orcamento_padrao'] loop
    execute format('drop policy "membro com código de finanças mexe nas finanças da casa" on public.%I', t);
    execute format($p$
      create policy "membro mexe nos dados da própria casa" on public.%I
        for all to authenticated
        using (casa_id in (select casa_id from public.membros_casa where user_id = (select auth.uid())))
        with check (casa_id in (select casa_id from public.membros_casa where user_id = (select auth.uid())))
    $p$, t);
  end loop;
end;
$$;

alter table public.membros_casa drop column ve_financas;
alter table public.casas drop column codigo_financas_hash;
