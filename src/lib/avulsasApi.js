// Tarefas avulsas: algo que só precisa ser feito num dia específico e não se repete.
// Ficam presas à data. Marcar como feita usa as mesmas conclusões das tarefas do plano (tarefaId = id da avulsa).
// A que não for feita continua naquele dia — não passa para o dia seguinte nem volta na outra semana.
// AGORA: guardado só neste aparelho (./armazenamento).
// COM SUPABASE: tabela `tarefas_avulsas` (id, casa_id, data, titulo, created_at). RLS por casa, como `conclusoes`.
import { ler, gravar } from './armazenamento'

// Avulsas entre duas datas AAAA-MM-DD, inclusive, na ordem em que foram criadas.
export async function listarAvulsas(inicio, fim) {
  return ler('tarefasAvulsas')
    .filter((t) => t.data >= inicio && t.data <= fim)
    .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))
}

export async function adicionarAvulsa(data, titulo) {
  const limpo = titulo.trim().replace(/\s+/g, ' ')
  if (!limpo) return
  gravar((db) => {
    db.tarefasAvulsas.push({ id: `avulsa-${crypto.randomUUID()}`, data, titulo: limpo, criadaEm: new Date().toISOString() })
  })
}

// Apaga a tarefa e a marcação de feita dela, se houver.
export async function removerAvulsa(id) {
  gravar((db) => {
    db.tarefasAvulsas = db.tarefasAvulsas.filter((t) => t.id !== id)
    db.conclusoes = db.conclusoes.filter((c) => c.tarefaId !== id)
  })
}
