# CLAUDE.md — Casa em dia (Família Oliveira Kohntopp)

App da casa da família, com três partes a partir da Home (`/`): **tarefas de casa** — um cômodo (ou dois) por dia, de segunda a sexta, com tarefas que somem quando feitas — e **lista de compras** — marca-se o que acabou durante a semana e, no mercado de sábado, o que foi comprado volta para "em casa" — e **coisas a fazer** — pendências sem dia certo (ex.: ligar no cartório), que ficam na lista até alguém resolver. Contexto de negócio em `docs/visao-do-produto.md`.

Para decisões maiores, consultar o `playbook-tecnico.md` nesta pasta. Ele foi escrito para projetos de saúde: aqui **não há dado de saúde**, então consentimento LGPD de dado sensível e prazo de retenção não se aplicam (rever se o app passar a guardar algo sensível).

## Inegociáveis
- **Stack fixa:** React 18 + Vite + Tailwind, react-router-dom, lucide-react, Supabase, Vercel ligado ao GitHub. Sem TypeScript, testes automatizados ou Redux.
- **Supabase para sincronizar os celulares, sem login (decisão da família em 01/11/2026):** cada aparelho entra como usuário anônimo do Supabase e, só na primeira vez, digita o **código da casa** (`src/pages/CodigoDaCasa.jsx`, função `entrar_na_casa`). Nada de e-mail, senha ou tela de login — não propor sem motivo novo. Projeto Supabase `nzojeisffhbmdtarsxoe` (sa-east-1), numa conta separada da conectada ao MCP: mudanças de banco viram arquivo em `supabase/migrations/` e a família cola no SQL Editor.
- As telas **só** falam com `src/lib/xxxApi.js` (funções assíncronas), e cada uma traz no topo a tabela e o RLS. Mudanças de outro celular chegam pelo Realtime (`src/lib/tempoReal.js`), que dispara `EVENTO_DADOS_ALTERADOS` e os hooks recarregam. Tabela nova precisa entrar na publicação `supabase_realtime` e na lista `TABELAS` de lá.
- **RLS por casa, não por usuário:** cada membro vê os dados da própria casa (`casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`). Sempre a forma com `(select auth.uid())`. `casa_id` vem do padrão `private.minha_casa_id()`: o app não manda.
- **Segredo só em Edge Function**, nunca no frontend. Uma única `supabaseClient.js`, só com a anon key.
- **Design:** cores e fontes só em `src/theme.js`. Nunca hex solto em componente. Exceções fora do React: `index.html` (theme-color), `public/manifest.webmanifest` e o ícone `public/icone.svg` — se a paleta mudar, mudar lá também e regerar os PNGs do ícone (180, 192 e 512).
- **Deploy:** GitHub → Vercel; `vercel.json` com rewrite SPA e cabeçalhos de segurança.

## Como o plano funciona
- Tudo em `src/data/plano.js`: `ROTINA_DIARIA`, `COMODOS` (tarefas de cada cômodo) e `DIAS` (quais cômodos em cada dia e por quê).
- Frequência pelo campo `semanas` (semana do mês: dias 1–7 = 1ª…): sem o campo = toda semana; dois números = a cada 15 dias; um número = mensal. Com `meses` junto, só naqueles meses (ex.: a cada 3 meses). Na 5ª semana (dias 29–31) só entram as semanais.
- Os `id` das tarefas ficam gravados nas conclusões: **nunca mudar o id de uma tarefa existente**. Para trocar o texto, mude só o `titulo`.
- `src/lib/agenda.js` monta o dia; `src/lib/useConclusoes.js` carrega e marca as feitas.
- Tarefas avulsas (`src/lib/avulsasApi.js`, cartão `CartaoAvulsas`): presas a uma data, usam as mesmas conclusões (tarefaId = `avulsa-…`). Toda contagem de progresso soma `tarefasDaAgenda` + avulsas do dia (PainelDoDia, ResumoSemana, Home).

## Convenções
- Telas: Home (`/`); Tarefas em `/tarefas` (Hoje), `/tarefas/semana` (e `/tarefas/semana/seg…sex`), `/tarefas/plano`; Compras em `/compras` (Lista) e `/compras/mercado` (No mercado), cada seção com abas (`LayoutSecao`); Coisas a fazer em `/afazer` (sem abas).
- Coisas a fazer (`src/lib/afazeresApi.js`): não têm data nem entram em contagem de tarefas da casa. Pendentes da mais antiga para a mais nova; feitas guardam `feitoEm` e só aparecem na tela por 30 dias. Cada uma tem `observacao` opcional (telefone, horário…).
- Lista de compras: estados `casa` → `falta` → `carrinho` → (concluir compra) → `casa`; o que não foi comprado fica em `falta`. Catálogo em `src/data/catalogo.js`: item novo no arquivo entra sozinho nos aparelhos (menos os que a família apagou pelo app, anotados em `itensApagados`); para tirar um item que já está nos aparelhos, pôr o id em `ITENS_RETIRADOS` (ou a seção inteira em `SECOES_RETIRADAS`). Trocar o nome de um item muda o id: retirar o antigo e incluir o novo. Cada item tem `quantidade` (1 a 99, volta a 1 quando sai da lista) e `observacao`. Lógica em `src/lib/comprasApi.js`.
- Mobile primeiro: o menu fica embaixo no celular. Conferir toda mudança de tela no celular (390) e no computador (1280), sem rolagem lateral. Nenhum texto abaixo de 12 px (`text-xs`).
- Cartões com `Cartao` (`rounded-2xl p-5 sm:p-6`).
- Ambiente local: `npm run dev -- --port 5191`. Se uma classe nova do Tailwind não aparecer, reiniciar o servidor (já aconteceu de ele ficar com o CSS velho).
- Conferir tela com captura: Edge sem janela (`msedge --headless=new --screenshot`) não desenha abaixo de ~500 px de largura — usar 600 para "celular" e 1280 para computador.
- Commits em português, verbo no imperativo, descrevendo o efeito para quem usa. Sem `feat:`/`fix:`.
