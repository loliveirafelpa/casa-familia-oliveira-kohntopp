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
- `src/lib/supabaseClient.js` — o único cliente do Supabase (só a anon key, lida de `.env.local`; modelo em `.env.example`).
- `src/lib/sessaoApi.js` + `useSessao.js` + `src/pages/CodigoDaCasa.jsx` — entrada sem login: sessão anônima e código da casa na primeira vez.
- `src/lib/tempoReal.js` — avisos ao vivo (Realtime): quando outro celular mexe, as telas recarregam.
- `src/components/` — `PainelDoDia` (a lista do dia), `ResumoSemana`, `LinhaTarefa`, `SeloFrequencia`, `BarraProgresso`, `Cartao`.
- `src/pages/app/` — `Inicio` (Home, `/`); tarefas: `Hoje` (`/tarefas`), `Semana`, `Dia` (`/tarefas/semana/:slug`) e `Plano`; compras: `Compras` (`/compras`) e `Mercado` (`/compras/mercado`); `AFazer` (`/afazer`). `LayoutSecao` desenha as abas de cada parte.
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
- Coisas a fazer: pendências sem data. Ficam na lista (as mais antigas em cima) até serem marcadas; têm anotação opcional; feitas aparecem em "Feitas" por 30 dias e podem ser desmarcadas. Não contam no progresso das tarefas de casa. Lógica em `src/lib/afazeresApi.js`.

## Banco de dados (Supabase, projeto `nzojeisffhbmdtarsxoe`)
- `casas` (id, nome, codigo_hash) e `membros_casa` (casa_id, user_id).
- `conclusoes` (id, casa_id, data, tarefa_id, concluida_por, created_at), única por (casa_id, data, tarefa_id).
- `itens_compra` (casa_id, id, nome, secao, estado, quantidade, observacao, updated_at) e `itens_apagados` (casa_id, item_id).
- `tarefas_avulsas` (id, casa_id, data, titulo, created_at).
- `afazeres` (id, casa_id, titulo, observacao, created_at, feito_em — nulo enquanto pendente).
- RLS em todas: membro só lê e grava dados da própria casa, com `(select auth.uid())`. Todas na publicação `supabase_realtime`.
- Migrations em `supabase/migrations/`, aplicadas colando no SQL Editor do painel.

### Entrada sem login
Cada aparelho entra como usuário anônimo (Authentication → Sign In / Providers → "Allow anonymous sign-ins" precisa estar ligado) e, na primeira vez, digita o código da casa. `entrar_na_casa(codigo)` confere o hash e torna o aparelho membro; 10 erros em uma hora bloqueiam o aparelho por uma hora. O app normaliza o código (minúsculas, sem acentos, espaços simples) antes de mandar.

Trocar o código (escrever em minúsculas e sem acentos; cada aparelho já dentro continua dentro):
```sql
update public.casas set codigo_hash = extensions.crypt('novo codigo', extensions.gen_salt('bf'));
```
Tirar todos os aparelhos da casa (todos terão de digitar o código de novo): `delete from auth.users where is_anonymous;`

## Deploy
No ar em https://casa-familia-oliveira-kohntopp.vercel.app. GitHub → Vercel (publicação automática a cada push na `main`). Os endereços com código no meio (`...-n87r0b7qz-...vercel.app`) são de cada publicação e pedem login no Vercel; para usar, sempre o endereço principal. `vercel.json` já tem rewrite de SPA e cabeçalhos de segurança. Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do Vercel (Settings → Environment Variables); mudar lá exige publicar de novo.

## Falta
- Ver perguntas em aberto em `docs/visao-do-produto.md`.
