// Tarefas concluídas: uma por (data, tarefa). Marcar de novo a mesma tarefa no mesmo dia não duplica.
// Tabela `conclusoes` (id, casa_id, data, tarefa_id, concluida_por, created_at), única por (casa_id, data, tarefa_id).
// RLS: cada membro vê, marca e desmarca só as da própria casa —
// `casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`.
// casa_id e concluida_por são preenchidos pelo banco.
import { conferir, supabase } from './supabaseClient'

// Conclusões entre duas datas AAAA-MM-DD, inclusive.
export async function listarConclusoes(inicio, fim) {
  const linhas = conferir(await supabase.from('conclusoes').select('data, tarefa_id').gte('data', inicio).lte('data', fim))
  return linhas.map((c) => ({ data: c.data, tarefaId: c.tarefa_id }))
}

export async function concluirTarefa(data, tarefaId) {
  conferir(
    await supabase
      .from('conclusoes')
      .upsert({ data, tarefa_id: tarefaId }, { onConflict: 'casa_id,data,tarefa_id', ignoreDuplicates: true }),
  )
}

export async function desfazerConclusao(data, tarefaId) {
  conferir(await supabase.from('conclusoes').delete().eq('data', data).eq('tarefa_id', tarefaId))
}
