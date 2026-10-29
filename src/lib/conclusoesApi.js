// Tarefas concluídas: uma por (data, tarefa). Marcar de novo a mesma tarefa no mesmo dia não duplica.
// AGORA: guardado só neste aparelho (./armazenamento).
// COM SUPABASE: tabela `conclusoes` (id, casa_id, data, tarefa_id, concluida_por, created_at),
// única por (casa_id, data, tarefa_id). RLS: cada membro vê, marca e desmarca só as da própria casa —
// `casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`.
import { ler, gravar } from './armazenamento'

// Conclusões entre duas datas AAAA-MM-DD, inclusive.
export async function listarConclusoes(inicio, fim) {
  return ler('conclusoes').filter((c) => c.data >= inicio && c.data <= fim)
}

export async function concluirTarefa(data, tarefaId) {
  gravar((db) => {
    if (db.conclusoes.some((c) => c.data === data && c.tarefaId === tarefaId)) return
    db.conclusoes.push({ data, tarefaId, concluidaEm: new Date().toISOString() })
  })
}

export async function desfazerConclusao(data, tarefaId) {
  gravar((db) => {
    db.conclusoes = db.conclusoes.filter((c) => !(c.data === data && c.tarefaId === tarefaId))
  })
}
