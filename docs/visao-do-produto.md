# Casa em dia — visão do produto

*Documento não-técnico. Cole no início de uma conversa nova para recuperar o contexto.*

## O que é
Um app de controle da limpeza doméstica da Família Oliveira Kohntopp. Cada dia útil é dedicado a um cômodo (às vezes dois). Quem limpa abre o app, vê o que fazer hoje e marca cada tarefa como feita, e ela some da lista.

## Por quê
Para a limpeza não acumular no fim de semana: espalhar o trabalho de segunda a sexta, em partes leves, e deixar o sábado e o domingo livres.

## A casa
Apartamento de 100 m²:
- sala de estar e jantar integradas (sofá, rack, buffet);
- cozinha completa (dois balcões grandes, vários eletrodomésticos);
- lavanderia com armários;
- escritório (cama de casal, escrivaninha, três estantes de livros);
- quarto do bebê (berço, guarda-roupa embutido grande);
- suíte do casal (cama, poltrona de amamentação, cômoda trocador, banheiro com box);
- banheiro social com box, que também serve de lavabo para visitas.

## Divisão da semana (sugestão inicial)
| Dia | Cômodos | Por quê |
|---|---|---|
| Segunda | Cozinha | É o que mais acumula no fim de semana. |
| Terça | Os dois banheiros | Mesmos produtos e mesmo passo a passo. |
| Quarta | Suíte do casal + quarto do bebê | A roupa de cama dos dois vai numa leva só. |
| Quinta | Escritório + lavanderia | Dois cômodos de uso mais leve; estantes em rodízio. |
| Sexta | Sala | A casa fica arrumada para o fim de semana e as visitas. |

Além disso, há uma rotina **todo dia**: louça, bancadas, lixo, devolver as coisas ao lugar, aspirador robô (e a manutenção dele) e roupa — lavar, tirar do varal, dobrar e guardar (o bebê suja muita roupa).

Tarefas pesadas (forno, geladeira por dentro, janelas, rejuntes, estantes, tapetes de pedra) aparecem a cada 15 dias ou uma vez por mês, espalhadas para nenhuma semana pesar mais que as outras.

A família tem **duas cachorras**: potes lavados toda semana, caminhas a cada 3 meses (janeiro, abril, julho e outubro) e o antipulgas na 4ª semana do mês (a última dose foi no dia 22).

Ajustes já feitos com a família (29/10/2026): o robô aspira e passa pano todo dia, então cada cômodo só tem os cantos e o que fica embaixo dos móveis; não há coifa; os tapetes dos banheiros são de pedra; as plantas são regadas na sexta, uma vez por semana. Ficaram de fora, por escolha da família: lixo reciclável (sai junto com o lixo diário), travesseiros e edredons, cortinas, filtro de água, ar-condicionado, vermífugo e vacinas, higienização de sofá e colchões.

## Estado atual (29/10/2026)
- Primeira versão funcionando no computador, com o plano revisado pela família: telas Hoje, Semana e Plano.
- As tarefas feitas ficam guardadas **só no aparelho** em que foram marcadas. Ainda não há login nem sincronização entre os celulares da família.
- Código no GitHub (`loliveirafelpa/casa-familia-oliveira-kohntopp`), publicação no Vercel em andamento.
- **Decisão (29/10/2026): seguir sem Supabase, login e usuários por enquanto.** Cada aparelho guarda as próprias marcações. Rever se a família quiser ver no celular o que o outro marcou.

## Perguntas em aberto
- Quem vai usar: só o casal, ou também uma diarista ou outra pessoa?
- Querem registrar **quem** fez cada tarefa?
- Tarefa não feita no dia deve "passar" para o dia seguinte ou simplesmente ficar para a próxima semana?
- Querem editar o plano pelo próprio app (adicionar, remover, mudar tarefas) ou ajustamos pelo Claude Code?
- Lembretes (notificação no celular) seriam úteis?
