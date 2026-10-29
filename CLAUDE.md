# CLAUDE.md — Casa em dia (Família Oliveira Kohntopp)

App de controle da limpeza do apartamento da família: um cômodo (ou dois) por dia, de segunda a sexta, com tarefas que somem da lista quando marcadas como feitas. Contexto de negócio em `docs/visao-do-produto.md`.

Para decisões maiores, consultar o `playbook-tecnico.md` nesta pasta. Ele foi escrito para projetos de saúde: aqui **não há dado de saúde**, então consentimento LGPD de dado sensível e prazo de retenção não se aplicam (rever se o app passar a guardar algo sensível).

## Inegociáveis
- **Stack fixa:** React 18 + Vite + Tailwind, react-router-dom, lucide-react, Supabase, Vercel ligado ao GitHub. Sem TypeScript, testes automatizados ou Redux.
- **Ainda sem Supabase.** As tarefas feitas ficam no localStorage do aparelho (`src/lib/armazenamento.js`). As telas **só** falam com `src/lib/xxxApi.js` (funções assíncronas), e cada uma traz no topo a tabela e o RLS previstos. Ao conectar o Supabase, só o corpo dessas funções muda.
- **RLS por casa, não por usuário:** quando o banco entrar, cada membro vê os dados da própria casa (`casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`). Sempre a forma com `(select auth.uid())`.
- **Segredo só em Edge Function**, nunca no frontend. Uma única `supabaseClient.js`, só com a anon key.
- **Design:** cores e fontes só em `src/theme.js`. Nunca hex solto em componente.
- **Deploy:** GitHub → Vercel; `vercel.json` com rewrite SPA e cabeçalhos de segurança.

## Como o plano funciona
- Tudo em `src/data/plano.js`: `ROTINA_DIARIA`, `COMODOS` (tarefas de cada cômodo) e `DIAS` (quais cômodos em cada dia e por quê).
- Frequência pelo campo `semanas` (semana do mês: dias 1–7 = 1ª…): sem o campo = toda semana; dois números = a cada 15 dias; um número = mensal. Na 5ª semana (dias 29–31) só entram as semanais.
- Os `id` das tarefas ficam gravados nas conclusões: **nunca mudar o id de uma tarefa existente**. Para trocar o texto, mude só o `titulo`.
- `src/lib/agenda.js` monta o dia; `src/lib/useConclusoes.js` carrega e marca as feitas.

## Convenções
- Telas: Hoje (`/`), Semana (`/semana`, e `/semana/seg…sex` para cada dia da semana atual), Plano (`/plano`).
- Mobile primeiro: o menu fica embaixo no celular. Conferir toda mudança de tela no celular (390) e no computador (1280), sem rolagem lateral. Nenhum texto abaixo de 12 px (`text-xs`).
- Cartões com `Cartao` (`rounded-2xl p-5 sm:p-6`).
- Ambiente local: `npm run dev -- --port 5191`.
- Commits em português, verbo no imperativo, descrevendo o efeito para quem usa. Sem `feat:`/`fix:`.
