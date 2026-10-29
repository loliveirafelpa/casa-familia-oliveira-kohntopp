# Casa em dia

App da casa da Família Oliveira Kohntopp: tarefas de limpeza (um cômodo por dia, de segunda a sexta, que somem ao serem feitas) e lista de compras (marca o que acabou durante a semana; no mercado de sábado, o comprado volta para "em casa"). Contexto de negócio em `docs/visao-do-produto.md`.

## Rodar localmente
```
npm install
npm run dev -- --port 5191
```
Abre em http://localhost:5191. `npm run build` gera a versão de produção em `dist/`; `npm run lint` confere o código.

## Organização
- `src/data/plano.js` — **o plano**: rotina diária, tarefas de cada cômodo (com frequência) e a divisão dos dias.
- `src/data/catalogo.js` — seções do mercado e os itens da lista de compras. Item novo no arquivo entra sozinho nos aparelhos; para retirar, usar `ITENS_RETIRADOS` (um item) ou `SECOES_RETIRADAS` (a seção inteira).
- `src/lib/comprasApi.js` + `useItensCompra.js` — estados dos itens (`casa`, `falta`, `carrinho`), concluir compra, adicionar e apagar itens.
- `src/lib/agenda.js` — monta a lista de uma data a partir do plano (inclui a regra da semana do mês).
- `src/lib/datas.js` — datas locais em AAAA-MM-DD.
- `src/lib/conclusoesApi.js` — gravar e ler tarefas feitas. `useConclusoes.js` é o hook que as telas usam.
- `src/lib/armazenamento.js` — armazenamento provisório no localStorage (sai quando o Supabase entrar).
- `src/components/` — `PainelDoDia` (a lista do dia), `ResumoSemana`, `LinhaTarefa`, `SeloFrequencia`, `BarraProgresso`, `Cartao`.
- `src/pages/app/` — `Inicio` (Home, `/`); tarefas: `Hoje` (`/tarefas`), `Semana`, `Dia` (`/tarefas/semana/:slug`) e `Plano`; compras: `Compras` (`/compras`) e `Mercado` (`/compras/mercado`). `LayoutSecao` desenha as abas de cada parte.
- `src/theme.js` — cores e fontes (as fontes são carregadas no `index.html`).

## Regras de negócio implementadas
- Segunda a sexta têm cômodos; sábado e domingo mostram o resumo da semana.
- Frequência pela semana do mês (dias 1–7 = 1ª, 8–14 = 2ª, 15–21 = 3ª, 22–28 = 4ª): semanal, a cada 15 dias (`[1,3]`/`[2,4]`) ou mensal (`[n]`). Dias 29–31 só têm tarefas semanais.
- A cada 3 meses: `semanas: [n]` + `meses: [1, 4, 7, 10]` (a tarefa só aparece nesses meses).
- Uma conclusão vale para uma data: na semana seguinte a tarefa volta.
- Dá para marcar tarefas de outro dia da semana atual (adiantar ou terminar depois).
- Tarefas avulsas ("Só hoje" / "Só neste dia"): escritas à mão para uma data, contam no progresso daquele dia e não se repetem; se não forem feitas, ficam naquele dia. Apagar uma avulsa apaga também a marcação de feita. Lógica em `src/lib/avulsasApi.js`.
- Compras: tocar num item do catálogo marca "falta"; no mercado, tocar põe no carrinho; "Concluir compra" devolve o carrinho para "em casa" e o que não foi encontrado continua na lista. "Adicionar manualmente" cria um item fora do catálogo (seção "Outros" se nenhuma for escolhida) já na lista; se o nome já existe (ignorando maiúsculas e acentos), só marca o existente. A busca do catálogo só filtra.
- Cada item entra na lista com quantidade 1; o contador − + da Lista da semana vai de 1 a 99, e no mercado aparece "3×" antes do nome quando for mais de 1. Ao concluir a compra ou tirar da lista, volta para 1.
- No sábado, o cartão de compras da Home leva direto ao modo mercado.

## Banco de dados (previsto, ainda não criado)
- `casas` (id, nome) e `membros_casa` (casa_id, user_id).
- `conclusoes` (id, casa_id, data, tarefa_id, concluida_por, created_at), única por (casa_id, data, tarefa_id).
- `itens_compra` (id, casa_id, nome, secao, estado, quantidade, observacao, updated_at).
- `tarefas_avulsas` (id, casa_id, data, titulo, created_at).
- RLS em todas: membro só lê e grava dados da própria casa, com `(select auth.uid())`.
- Migrations em `supabase/migrations/`.

## Deploy
No ar em https://casa-familia-oliveira-kohntopp.vercel.app. GitHub → Vercel (publicação automática a cada push na `main`). Os endereços com código no meio (`...-n87r0b7qz-...vercel.app`) são de cada publicação e pedem login no Vercel; para usar, sempre o endereço principal. `vercel.json` já tem rewrite de SPA e cabeçalhos de segurança. Variáveis do Supabase (quando entrar) ficam no painel do Vercel.

## Falta
- Supabase (adiado por decisão da família em 29/10/2026): login, tabelas acima e troca do corpo de `conclusoesApi.js`, só se quiserem sincronizar os celulares.
- Ver perguntas em aberto em `docs/visao-do-produto.md`.
