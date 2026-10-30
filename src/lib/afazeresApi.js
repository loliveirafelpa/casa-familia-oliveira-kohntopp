// "Coisas a fazer": pendências da casa sem dia marcado (ex.: ligar no cartório). Ficam na lista até alguém resolver.
// AGORA: guardado só neste aparelho (./armazenamento).
// COM SUPABASE: tabela `afazeres` (id, casa_id, titulo, observacao, created_at, feito_em null = pendente).
// RLS por casa: casa_id in (select casa_id from membros_casa where user_id = (select auth.uid())).
import { ler, gravar } from './armazenamento'

const DIAS_FEITAS_VISIVEIS = 30 // as feitas há mais tempo que isso somem da tela (continuam guardadas)

const limpar = (texto) => texto.trim().replace(/\s+/g, ' ')

// Pendentes (mais antigas primeiro, para nada ficar esquecido) e feitas recentes (a última feita primeiro).
export async function listarAfazeres() {
  const todos = ler('afazeres')
  const limite = new Date(Date.now() - DIAS_FEITAS_VISIVEIS * 864e5).toISOString()
  return {
    pendentes: todos.filter((a) => !a.feitoEm).sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)),
    feitas: todos.filter((a) => a.feitoEm && a.feitoEm >= limite).sort((a, b) => b.feitoEm.localeCompare(a.feitoEm)),
  }
}

export async function adicionarAfazer(titulo) {
  const limpo = limpar(titulo)
  if (!limpo) return
  gravar((db) => {
    db.afazeres.push({ id: crypto.randomUUID(), titulo: limpo, observacao: '', criadoEm: new Date().toISOString(), feitoEm: null })
  })
}

function alterar(id, mudar) {
  gravar((db) => {
    const afazer = db.afazeres.find((a) => a.id === id)
    if (afazer) mudar(afazer)
  })
}

export async function marcarAfazer(id, feito) {
  alterar(id, (a) => {
    a.feitoEm = feito ? new Date().toISOString() : null
  })
}

export async function salvarObservacaoAfazer(id, observacao) {
  alterar(id, (a) => {
    a.observacao = limpar(observacao)
  })
}

export async function removerAfazer(id) {
  gravar((db) => {
    db.afazeres = db.afazeres.filter((a) => a.id !== id)
  })
}
