// Lista de compras: cada item do catálogo da casa está em um de três estados —
// 'casa' (tem em casa), 'falta' (precisa comprar) ou 'carrinho' (já pegou no mercado).
// Durante a semana: casa ⇄ falta. No mercado: falta ⇄ carrinho. "Concluir compra" leva o carrinho de volta
// para 'casa'; o que ficou em 'falta' (não encontrado) passa para a semana seguinte.
// AGORA: guardado só neste aparelho (./armazenamento). Na primeira vez, o catálogo vem de src/data/catalogo.js.
// COM SUPABASE: tabela `itens_compra` (id, casa_id, nome, secao, estado, quantidade, observacao, updated_at).
// RLS: cada membro lê e grava só os itens da própria casa —
// `casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`.
import { ler, gravar } from './armazenamento'
import { ITENS_INICIAIS, ITENS_RETIRADOS, SECOES_RETIRADAS } from '../data/catalogo'

const agora = () => new Date().toISOString()
// Item de volta para casa: sem observação e com quantidade 1 para a próxima vez.
const EM_CASA = { estado: 'casa', observacao: '', quantidade: 1 }
const doCatalogo = (i) => ({ ...i, ...EM_CASA, atualizadoEm: agora() })

// Nome para comparar sem diferença de maiúsculas, acentos e espaços ("Pão  francês" = "pao frances").
export const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

function itens(db) {
  db.itensCompra ??= ITENS_INICIAIS.map(doCatalogo)
  return db.itensCompra
}

// O que falta para a lista guardada acompanhar src/data/catalogo.js: itens novos do arquivo que a família
// não apagou pelo app, e itens guardados que foram retirados (um a um ou junto com a seção inteira).
function diferencasDoCatalogo(db) {
  const guardados = new Set(db.itensCompra.map((i) => i.id))
  const apagados = new Set(db.itensApagados)
  return {
    novos: ITENS_INICIAIS.filter((i) => !guardados.has(i.id) && !apagados.has(i.id)),
    retirados: db.itensCompra
      .filter((i) => ITENS_RETIRADOS.includes(i.id) || SECOES_RETIRADAS.includes(i.secao))
      .map((i) => i.id),
  }
}

// Cria o catálogo na primeira vez e, nas seguintes, acerta as diferenças — só grava se houver alguma.
function prepararCatalogo() {
  if (!ler('itensCompra')) gravar(itens)
  const { novos, retirados } = diferencasDoCatalogo({ itensCompra: ler('itensCompra'), itensApagados: ler('itensApagados') })
  if (novos.length === 0 && retirados.length === 0) return
  gravar((db) => {
    db.itensCompra = db.itensCompra.filter((i) => !retirados.includes(i.id)).concat(novos.map(doCatalogo))
  })
}

function alterarItem(id, mudanca) {
  gravar((db) => {
    const item = itens(db).find((i) => i.id === id)
    if (item) Object.assign(item, mudanca, { atualizadoEm: agora() })
  })
}

export async function listarItens() {
  prepararCatalogo()
  return ler('itensCompra')
}

// Durante a semana: acabou (true) ou ainda tem / desistiu (false). Voltar para casa limpa observação e quantidade.
export async function marcarFalta(id, falta) {
  alterarItem(id, falta ? { estado: 'falta' } : EM_CASA)
}

// Quantas unidades comprar (de 1 a 99). Itens guardados antes da quantidade existir contam como 1.
export async function alterarQuantidade(id, quantidade) {
  alterarItem(id, { quantidade: Math.min(99, Math.max(1, Math.round(quantidade))) })
}

export async function salvarObservacao(id, observacao) {
  alterarItem(id, { observacao: observacao.trim() })
}

// No mercado: pegou (true) ou devolveu à prateleira (false).
export async function marcarCarrinho(id, noCarrinho) {
  alterarItem(id, { estado: noCarrinho ? 'carrinho' : 'falta' })
}

// Fim da compra: o que está no carrinho volta para casa. Devolve quantos itens foram comprados.
export async function concluirCompra() {
  let comprados = 0
  gravar((db) => {
    for (const item of itens(db)) {
      if (item.estado !== 'carrinho') continue
      Object.assign(item, EM_CASA, { atualizadoEm: agora() })
      comprados++
    }
  })
  return comprados
}

// Item novo já entra como "falta" (quem digita é porque precisa). Se o nome já existe, só marca o que já existe.
export async function adicionarItem(nome, secao) {
  const limpo = nome.trim().replace(/\s+/g, ' ')
  if (!limpo) return
  gravar((db) => {
    const lista = itens(db)
    const existente = lista.find((i) => normalizar(i.nome) === normalizar(limpo))
    if (existente) {
      if (existente.estado === 'casa') Object.assign(existente, { estado: 'falta', atualizadoEm: agora() })
      return
    }
    const novo = { id: crypto.randomUUID(), nome: limpo, secao, ...EM_CASA, estado: 'falta', atualizadoEm: agora() }
    lista.push(novo)
  })
}

// Apagar pelo app é definitivo: o id fica anotado para o item do catálogo não voltar na próxima sincronização.
export async function removerItem(id) {
  gravar((db) => {
    db.itensCompra = itens(db).filter((i) => i.id !== id)
    if (!db.itensApagados.includes(id)) db.itensApagados.push(id)
  })
}
