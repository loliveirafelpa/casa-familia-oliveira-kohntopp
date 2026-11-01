// Regras de cálculo das Finanças: funções puras, sem banco. Recebem um mês como vem de financasApi
// ({ saldo_inicial, divisao_ativa, divisao_recebido, contas, entradas, lancamentos }) e devolvem o resumo da tela.
// Portadas de lib/financas/calculos.ts (pacote "financas-casa-docs"), com uma correção:
// mercado pago fora do cartão desconta do "saldo esperado hoje" (antes só aumentava a previsão da linha Mercado).
import { DIVISAO, FORMAS_FORA_DO_CARTAO } from '../data/financas'

const soma = (xs) => xs.reduce((t, x) => t + (x ?? 0), 0)
export const r2 = (v) => Math.round(v * 100) / 100

/*
 * Valor de cada conta no mês (projetado):
 * 1. com realizado, vale o realizado;
 * 2. fatura de cartão sem realizado: o maior entre o previsto e o lançado nesse cartão;
 * 3. Mercado sem realizado: o maior entre o previsto e o mercado lançado fora do cartão;
 * 4. senão, o previsto (vazio = 0).
 * Lançamentos no cartão não somam de novo (já estão na fatura); mercado fora do cartão alimenta a linha Mercado;
 * o resto fora do cartão é "avulso" e soma direto nas saídas.
 */
export function calcularMes(m) {
  const lancadoPorCartao = {}
  let mercadoForaDoCartao = 0
  let avulsos = 0

  const cartoes = new Set(m.contas.filter((c) => c.e_cartao).map((c) => c.id))
  const linhaMercado = m.contas.find((c) => c.e_mercado)

  for (const l of m.lancamentos) {
    const v = l.valor ?? 0
    if (l.forma === 'cartao') {
      if (l.conta_cartao_id && cartoes.has(l.conta_cartao_id)) {
        lancadoPorCartao[l.conta_cartao_id] = (lancadoPorCartao[l.conta_cartao_id] ?? 0) + v
      } else {
        avulsos += v // cartão sem fatura no mês: conta como avulso
      }
    } else if (l.categoria === 'Mercado' && linhaMercado) {
      mercadoForaDoCartao += v
    } else {
      avulsos += v
    }
  }

  const projetadoPorConta = {}
  for (const c of m.contas) {
    let v
    if (c.realizado != null) v = c.realizado
    else if (c.e_cartao) v = Math.max(c.previsto ?? 0, lancadoPorCartao[c.id] ?? 0)
    else if (c.e_mercado) v = Math.max(c.previsto ?? 0, mercadoForaDoCartao)
    else v = c.previsto ?? 0
    projetadoPorConta[c.id] = v
  }

  // Divisão: a fração das contas marcadas, pelo valor projetado.
  const itensDivisao = m.contas
    .filter((c) => c.entra_divisao)
    .map((c) => ({ contaId: c.id, nome: c.nome, valor: projetadoPorConta[c.id], previsto: c.realizado == null }))
  const totalDivisao = r2(soma(itensDivisao.map((i) => i.valor)))
  const parte = r2(totalDivisao * DIVISAO.fracao)
  const ativa = m.divisao_ativa
  const recebidoDivisao = m.divisao_recebido

  const entPrev = soma(m.entradas.map((e) => e.previsto)) + (ativa ? parte : 0)
  const entRec = soma(m.entradas.map((e) => e.recebido)) + (ativa ? recebidoDivisao ?? 0 : 0)
  const entEf = soma(m.entradas.map((e) => e.recebido ?? e.previsto)) + (ativa ? recebidoDivisao ?? parte : 0)
  const existemEntradas = m.entradas.length > 0 || ativa

  // O que já saiu da conta: contas com valor real, avulsos e — correção — o mercado pago fora do cartão,
  // enquanto a linha Mercado não tem realizado (quando tiver, o realizado já inclui essas compras).
  const mercadoJaPago = linhaMercado && linhaMercado.realizado == null ? mercadoForaDoCartao : 0
  const saiPrev = soma(m.contas.map((c) => c.previsto))
  const saiLanc = soma(m.contas.map((c) => c.realizado)) + avulsos + mercadoJaPago
  const saiProj = soma(Object.values(projetadoPorConta)) + avulsos

  const sobra = r2(entEf - saiProj)

  const fechados = m.contas.filter((c) => c.e_cartao && c.realizado != null && c.previsto != null)
  const folga = r2(soma(fechados.map((c) => c.previsto - c.realizado)))

  return {
    projetadoPorConta,
    lancadoPorCartao,
    mercadoForaDoCartao,
    avulsos,
    divisao: {
      ativa,
      itens: itensDivisao,
      total: totalDivisao,
      parte,
      recebido: recebidoDivisao,
      falta: ativa ? Math.max(0, r2(parte - (recebidoDivisao ?? 0))) : 0,
    },
    entradas: { previsto: r2(entPrev), recebido: r2(entRec), efetivo: r2(entEf), existem: existemEntradas },
    saidas: { previsto: r2(saiPrev), lancado: r2(saiLanc), projetado: r2(saiProj) },
    sobra,
    comprometido: entEf ? Math.round((saiProj / entEf) * 100) : null, // % da renda; null sem entradas
    contasPagas: m.contas.filter((c) => c.pago).length,
    totalContas: m.contas.length,
    saldo: {
      inicial: m.saldo_inicial,
      esperadoHoje: m.saldo_inicial != null ? r2(m.saldo_inicial + entRec - saiLanc) : null,
      fimDoMes: m.saldo_inicial != null ? r2(m.saldo_inicial + sobra) : null,
    },
    folgaCartoes: fechados.length && folga > 0 ? { valor: folga, faturas: fechados.length } : null,
  }
}

// Saldo inicial sugerido: a previsão de fim do mês anterior (null se o anterior não tem saldo inicial).
export function sugerirSaldoInicial(mesAnterior) {
  if (!mesAnterior || mesAnterior.saldo_inicial == null) return null
  return calcularMes(mesAnterior).saldo.fimDoMes
}

// Texto digitado → valor. Aceita "1.234,56", "1234,56", "1234.56", "R$ 45,90". null = vazio; NaN = inválido.
export function lerValor(texto) {
  if (texto == null) return null
  let t = String(texto).replace(/R\$|\s/g, '')
  if (!t) return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '')
  const n = Number(t)
  return Number.isFinite(n) ? r2(n) : NaN
}

export const reais = (v) =>
  v == null || Number.isNaN(v) ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Número para campo de texto: "1.234,56" (vazio para null).
export const numero = (v) =>
  v == null || Number.isNaN(v) ? '' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// "2026-11" ⇄ data do banco "2026-11-01"
const NOMES_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const nomeDoMes = (am) => {
  const [a, m] = am.split('-').map(Number)
  const nome = NOMES_MESES[m - 1]
  return `${nome[0].toUpperCase()}${nome.slice(1)} de ${a}`
}
export const mesCurto = (am) => `${NOMES_MESES[Number(am.slice(5, 7)) - 1].slice(0, 3)}/${am.slice(2, 4)}`
export const mesDe = (iso) => iso.slice(0, 7)
export function somarMeses(am, n) {
  const [a, m] = am.split('-').map(Number)
  const d = new Date(a, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Opções de pagamento de um mês: os cartões (contas marcadas como fatura) e as formas fora do cartão.
export const formasDoMes = (mes) => [
  ...mes.contas.filter((c) => c.e_cartao).map((c) => ({ id: c.id, nome: c.nome })),
  ...FORMAS_FORA_DO_CARTAO,
]
