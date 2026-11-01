// Tarefas avulsas: algo que só precisa ser feito num dia específico e não se repete.
// Ficam presas à data. Marcar como feita usa as mesmas conclusões das tarefas do plano (tarefaId = id da avulsa).
// A que não for feita continua naquele dia — não passa para o dia seguinte nem volta na outra semana.
// Tabela `tarefas_avulsas` (id 'avulsa-…', casa_id, data, titulo, created_at). RLS por casa, como `conclusoes`.
import { conferir, supabase } from './supabaseClient'

// Avulsas entre duas datas AAAA-MM-DD, inclusive, na ordem em que foram criadas.
export async function listarAvulsas(inicio, fim) {
  const linhas = conferir(
    await supabase
      .from('tarefas_avulsas')
      .select('id, data, titulo, created_at')
      .gte('data', inicio)
      .lte('data', fim)
      .order('created_at'),
  )
  return linhas.map((t) => ({ id: t.id, data: t.data, titulo: t.titulo, criadaEm: t.created_at }))
}

export async function adicionarAvulsa(data, titulo) {
  const limpo = titulo.trim().replace(/\s+/g, ' ')
  if (!limpo) return
  conferir(await supabase.from('tarefas_avulsas').insert({ id: `avulsa-${crypto.randomUUID()}`, data, titulo: limpo }))
}

// Apaga a tarefa e a marcação de feita dela, se houver.
export async function removerAvulsa(id) {
  conferir(await supabase.from('conclusoes').delete().eq('tarefa_id', id))
  conferir(await supabase.from('tarefas_avulsas').delete().eq('id', id))
}
