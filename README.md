# Casa em dia

Controle da limpeza doméstica da Família Oliveira Kohntopp: um cômodo por dia, de segunda a sexta, com tarefas que somem ao serem marcadas como feitas. Contexto de negócio em `docs/visao-do-produto.md`.

## Rodar localmente
```
npm install
npm run dev -- --port 5191
```
Abre em http://localhost:5191. `npm run build` gera a versão de produção em `dist/`; `npm run lint` confere o código.

## Organização
- `src/data/plano.js` — **o plano**: rotina diária, tarefas de cada cômodo (com frequência) e a divisão dos dias.
- `src/lib/agenda.js` — monta a lista de uma data a partir do plano (inclui a regra da semana do mês).
- `src/lib/datas.js` — datas locais em AAAA-MM-DD.
- `src/lib/conclusoesApi.js` — gravar e ler tarefas feitas. `useConclusoes.js` é o hook que as telas usam.
- `src/lib/armazenamento.js` — armazenamento provisório no localStorage (sai quando o Supabase entrar).
- `src/components/` — `PainelDoDia` (a lista do dia), `ResumoSemana`, `LinhaTarefa`, `SeloFrequencia`, `BarraProgresso`, `Cartao`.
- `src/pages/app/` — `Hoje`, `Semana`, `Dia` (`/semana/:slug`) e `Plano`.
- `src/theme.js` — cores e fontes (as fontes são carregadas no `index.html`).

## Regras de negócio implementadas
- Segunda a sexta têm cômodos; sábado e domingo mostram o resumo da semana.
- Frequência pela semana do mês (dias 1–7 = 1ª, 8–14 = 2ª, 15–21 = 3ª, 22–28 = 4ª): semanal, a cada 15 dias (`[1,3]`/`[2,4]`) ou mensal (`[n]`). Dias 29–31 só têm tarefas semanais.
- Uma conclusão vale para uma data: na semana seguinte a tarefa volta.
- Dá para marcar tarefas de outro dia da semana atual (adiantar ou terminar depois).

## Banco de dados (previsto, ainda não criado)
- `casas` (id, nome) e `membros_casa` (casa_id, user_id).
- `conclusoes` (id, casa_id, data, tarefa_id, concluida_por, created_at), única por (casa_id, data, tarefa_id).
- RLS em todas: membro só lê e grava dados da própria casa, com `(select auth.uid())`.
- Migrations em `supabase/migrations/`.

## Deploy
GitHub → Vercel (publicação automática a cada push na `main`). `vercel.json` já tem rewrite de SPA e cabeçalhos de segurança. Variáveis do Supabase (quando entrar) ficam no painel do Vercel.

## Falta
- Criar repositório no GitHub e projeto no Vercel.
- Supabase: login da família, tabelas acima e troca do corpo de `conclusoesApi.js`.
- Ver perguntas em aberto em `docs/visao-do-produto.md`.
