// Finanças da casa. Tabelas `fin_meses`, `fin_contas`, `fin_entradas`, `fin_lancamentos` e `fin_orcamento_padrao`
// (migração 20261101140000_financas.sql). casa_id é preenchido pelo banco.
// RLS por casa, como as outras tabelas (abertas a todos os membros desde 20261101150000_financas_abertas.sql) —
// `casa_id in (select casa_id from membros_casa where user_id = (select auth.uid()))`.
import { conferir, supabase } from './supabaseClient'

// ---------- leitura ----------

const ORDEM = { ascending: true }

// Todos os meses com contas, entradas e lançamentos (é pouco: algumas dezenas de linhas por mês).
// Devolve um objeto { 'AAAA-MM': mes }, cada mês já no formato que financasCalculos espera.
export async function carregarFinancas() {
  const [meses, contas, entradas, lancamentos] = await Promise.all([
    supabase.from('fin_meses').select('id, mes, saldo_inicial, nota, divisao_ativa, divisao_recebido').order('mes'),
    supabase
      .from('fin_contas')
      .select('id, mes_id, nome, grupo, previsto, realizado, pago, e_cartao, e_mercado, entra_divisao, ordem')
      .order('ordem', ORDEM)
      .order('created_at', ORDEM),
    supabase.from('fin_entradas').select('id, mes_id, nome, previsto, recebido, ordem').order('ordem', ORDEM).order('created_at', ORDEM),
    supabase
      .from('fin_lancamentos')
      .select('id, mes_id, data, descricao, categoria, forma, conta_cartao_id, valor, created_at')
      .order('data', { ascending: false })
      .order('created_at', { ascending: false }),
  ])
  const porMes = (linhas, id) => linhas.filter((l) => l.mes_id === id)
  const [c, e, l] = [conferir(contas), conferir(entradas), conferir(lancamentos)]
  const resultado = {}
  for (const m of conferir(meses)) {
    resultado[m.mes.slice(0, 7)] = { ...m, contas: porMes(c, m.id), entradas: porMes(e, m.id), lancamentos: porMes(l, m.id) }
  }
  return resultado
}

// ---------- meses ----------

// Abre o mês 'AAAA-MM' com o orçamento padrão (se já existe, só devolve o id).
export async function abrirMes(am) {
  return conferir(await supabase.rpc('fin_criar_mes', { p_mes: `${am}-01` }))
}

export async function alterarMes(mesId, mudanca) {
  conferir(await supabase.from('fin_meses').update(mudanca).eq('id', mesId))
}

export async function salvarComoPadrao(mesId) {
  conferir(await supabase.rpc('fin_salvar_padrao', { p_mes_id: mesId }))
}

// ---------- contas e entradas ----------

const limpar = (texto) => texto.trim().replace(/\s+/g, ' ')

export async function adicionarConta(mesId, { nome, grupo, previsto, eCartao, entraDivisao, ordem }) {
  conferir(
    await supabase.from('fin_contas').insert({
      mes_id: mesId,
      nome: limpar(nome),
      grupo,
      previsto,
      e_cartao: eCartao,
      entra_divisao: entraDivisao,
      ordem,
    }),
  )
}

// mudanca: { previsto }, { realizado } ou { pago }. Preencher o realizado marca como paga (gatilho no banco).
export async function alterarConta(id, mudanca) {
  conferir(await supabase.from('fin_contas').update(mudanca).eq('id', id))
}

export async function removerConta(id) {
  conferir(await supabase.from('fin_contas').delete().eq('id', id))
}

export async function adicionarEntrada(mesId, { nome, previsto, ordem }) {
  conferir(await supabase.from('fin_entradas').insert({ mes_id: mesId, nome: limpar(nome), previsto, ordem }))
}

export async function alterarEntrada(id, mudanca) {
  conferir(await supabase.from('fin_entradas').update(mudanca).eq('id', id))
}

export async function removerEntrada(id) {
  conferir(await supabase.from('fin_entradas').delete().eq('id', id))
}

// ---------- lançamentos ----------

// forma: id de uma conta de cartão do mês, 'pix_debito' ou 'dinheiro'.
export async function lancar(mesId, { data, descricao, categoria, forma, valor }) {
  const noCartao = forma !== 'pix_debito' && forma !== 'dinheiro'
  conferir(
    await supabase.from('fin_lancamentos').insert({
      mes_id: mesId,
      data,
      descricao: limpar(descricao),
      categoria,
      forma: noCartao ? 'cartao' : forma,
      conta_cartao_id: noCartao ? forma : null,
      valor,
    }),
  )
}

export async function removerLancamento(id) {
  conferir(await supabase.from('fin_lancamentos').delete().eq('id', id))
}
