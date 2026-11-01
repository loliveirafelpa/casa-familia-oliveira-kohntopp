// "Coisas a fazer": pendências da casa sem dia marcado (ex.: ligar no cartório). Ficam na lista até alguém resolver.
// Tabela `afazeres` (id, casa_id, titulo, observacao, created_at, feito_em null = pendente).
// RLS por casa: casa_id in (select casa_id from membros_casa where user_id = (select auth.uid())).
import { conferir, supabase } from './supabaseClient'

const DIAS_FEITAS_VISIVEIS = 30 // as feitas há mais tempo que isso somem da tela (continuam guardadas)

const limpar = (texto) => texto.trim().replace(/\s+/g, ' ')
const CAMPOS = 'id, titulo, observacao, created_at, feito_em'
const paraTela = (a) => ({ id: a.id, titulo: a.titulo, observacao: a.observacao, criadoEm: a.created_at, feitoEm: a.feito_em })

// Pendentes (mais antigas primeiro, para nada ficar esquecido) e feitas recentes (a última feita primeiro).
export async function listarAfazeres() {
  const limite = new Date(Date.now() - DIAS_FEITAS_VISIVEIS * 864e5).toISOString()
  const [pendentes, feitas] = await Promise.all([
    supabase.from('afazeres').select(CAMPOS).is('feito_em', null).order('created_at'),
    supabase.from('afazeres').select(CAMPOS).gte('feito_em', limite).order('feito_em', { ascending: false }),
  ])
  return { pendentes: conferir(pendentes).map(paraTela), feitas: conferir(feitas).map(paraTela) }
}

export async function adicionarAfazer(titulo) {
  const limpo = limpar(titulo)
  if (!limpo) return
  conferir(await supabase.from('afazeres').insert({ titulo: limpo }))
}

const alterar = async (id, mudanca) => conferir(await supabase.from('afazeres').update(mudanca).eq('id', id))

export async function marcarAfazer(id, feito) {
  await alterar(id, { feito_em: feito ? new Date().toISOString() : null })
}

export async function salvarObservacaoAfazer(id, observacao) {
  await alterar(id, { observacao: limpar(observacao) })
}

export async function removerAfazer(id) {
  conferir(await supabase.from('afazeres').delete().eq('id', id))
}
