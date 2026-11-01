// Lista de compras: cada item do catálogo da casa está em um de três estados —
// 'casa' (tem em casa), 'falta' (precisa comprar) ou 'carrinho' (já pegou no mercado).
// Durante a semana: casa ⇄ falta. No mercado: falta ⇄ carrinho. "Concluir compra" leva o carrinho de volta
// para 'casa'; o que ficou em 'falta' (não encontrado) passa para a semana seguinte.
// Tabela `itens_compra` (casa_id, id, nome, secao, estado, quantidade, observacao, updated_at) e
// `itens_apagados` (casa_id, item_id). Na primeira vez, o catálogo vem de src/data/catalogo.js.
// RLS: cada membro lê e grava só os itens da própria casa —
// `casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`.
import { conferir, supabase } from './supabaseClient'
import { ITENS_INICIAIS, ITENS_RETIRADOS, SECOES_RETIRADAS } from '../data/catalogo'

const agora = () => new Date().toISOString()
// Item de volta para casa: sem observação e com quantidade 1 para a próxima vez.
const EM_CASA = { estado: 'casa', observacao: '', quantidade: 1 }

// Nome para comparar sem diferença de maiúsculas, acentos e espaços ("Pão  francês" = "pao frances").
export const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

const CAMPOS = 'id, nome, secao, estado, quantidade, observacao, updated_at'
const paraTela = ({ updated_at, ...item }) => ({ ...item, atualizadoEm: updated_at })

const buscarItens = async () => conferir(await supabase.from('itens_compra').select(CAMPOS).order('nome'))

// Acerta a lista da casa com src/data/catalogo.js: entram os itens novos do arquivo que a família não apagou
// pelo app, e saem os retirados (um a um ou junto com a seção inteira). Só grava se houver diferença.
// Dois celulares abrindo juntos não duplicam nada (ignoreDuplicates).
async function sincronizarCatalogo(guardados) {
  const apagados = new Set(conferir(await supabase.from('itens_apagados').select('item_id')).map((a) => a.item_id))
  const ids = new Set(guardados.map((i) => i.id))
  const novos = ITENS_INICIAIS.filter((i) => !ids.has(i.id) && !apagados.has(i.id))
  const retirados = guardados
    .filter((i) => ITENS_RETIRADOS.includes(i.id) || SECOES_RETIRADAS.includes(i.secao))
    .map((i) => i.id)

  if (novos.length) {
    conferir(
      await supabase
        .from('itens_compra')
        .upsert(novos.map((i) => ({ ...i, ...EM_CASA })), { onConflict: 'casa_id,id', ignoreDuplicates: true }),
    )
  }
  if (retirados.length) conferir(await supabase.from('itens_compra').delete().in('id', retirados))
  return novos.length > 0 || retirados.length > 0
}

export async function listarItens() {
  let itens = await buscarItens()
  if (await sincronizarCatalogo(itens)) itens = await buscarItens()
  return itens.map(paraTela)
}

const alterarItem = async (id, mudanca) =>
  conferir(await supabase.from('itens_compra').update({ ...mudanca, updated_at: agora() }).eq('id', id))

// Durante a semana: acabou (true) ou ainda tem / desistiu (false). Voltar para casa limpa observação e quantidade.
export async function marcarFalta(id, falta) {
  await alterarItem(id, falta ? { estado: 'falta' } : EM_CASA)
}

// Quantas unidades comprar (de 1 a 99).
export async function alterarQuantidade(id, quantidade) {
  await alterarItem(id, { quantidade: Math.min(99, Math.max(1, Math.round(quantidade))) })
}

export async function salvarObservacao(id, observacao) {
  await alterarItem(id, { observacao: observacao.trim() })
}

// No mercado: pegou (true) ou devolveu à prateleira (false).
export async function marcarCarrinho(id, noCarrinho) {
  await alterarItem(id, { estado: noCarrinho ? 'carrinho' : 'falta' })
}

// Fim da compra: o que está no carrinho volta para casa. Devolve quantos itens foram comprados.
export async function concluirCompra() {
  const comprados = conferir(
    await supabase.from('itens_compra').update({ ...EM_CASA, updated_at: agora() }).eq('estado', 'carrinho').select('id'),
  )
  return comprados.length
}

// Item novo já entra como "falta" (quem digita é porque precisa). Se o nome já existe, só marca o que já existe.
export async function adicionarItem(nome, secao) {
  const limpo = nome.trim().replace(/\s+/g, ' ')
  if (!limpo) return
  const existente = (await buscarItens()).find((i) => normalizar(i.nome) === normalizar(limpo))
  if (existente) {
    if (existente.estado === 'casa') await alterarItem(existente.id, { estado: 'falta' })
    return
  }
  conferir(
    await supabase.from('itens_compra').insert({ id: crypto.randomUUID(), nome: limpo, secao, ...EM_CASA, estado: 'falta' }),
  )
}

// Apagar pelo app é definitivo: o id fica anotado para o item do catálogo não voltar na próxima sincronização.
export async function removerItem(id) {
  conferir(await supabase.from('itens_apagados').upsert({ item_id: id }, { onConflict: 'casa_id,item_id', ignoreDuplicates: true }))
  conferir(await supabase.from('itens_compra').delete().eq('id', id))
}
