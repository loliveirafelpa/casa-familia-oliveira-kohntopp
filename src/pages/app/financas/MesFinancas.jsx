import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PiggyBank, Plus } from 'lucide-react'
import Cartao from '../../../components/Cartao'
import BarraProgresso from '../../../components/BarraProgresso'
import {
  BarraGasto,
  BotaoRemover,
  CampoDinheiro,
  Numero,
  classeBotao,
  classeCampo,
} from '../../../components/financas/Campos'
import { MesFechado } from './FinancasLayout'
import { CATEGORIAS, FORMAS_FORA_DO_CARTAO } from '../../../data/financas'
import { calcularMes, formasDoMes, lerValor, reais, somarMeses, sugerirSaldoInicial } from '../../../lib/financasCalculos'
import { deslocar, diaCurto, hojeLocal } from '../../../lib/datas'

const CHAVE_FORMA = 'financas-ultima-forma' // conveniência deste aparelho: a última forma de pagamento usada

function lerFormaGuardada() {
  try {
    return localStorage.getItem(CHAVE_FORMA)
  } catch {
    return null
  }
}

function guardarForma(forma) {
  try {
    localStorage.setItem(CHAVE_FORMA, forma)
  } catch {
    // sem armazenamento no navegador: só não lembra
  }
}

function Saldo({ mes, t, sugestao, alterarMes }) {
  return (
    <Cartao className="grid gap-5 sm:grid-cols-3">
      <div className="min-w-0">
        <p className="font-interface text-xs font-semibold uppercase tracking-wide text-textoSecundario">
          Saldo inicial do mês
        </p>
        <div className="mt-1">
          <CampoDinheiro
            valor={mes.saldo_inicial}
            rotulo="Saldo inicial do mês"
            placeholder="R$ 0,00"
            onSalvar={(v) => alterarMes(mes.id, { saldo_inicial: v })}
          />
        </div>
        {sugestao != null && mes.saldo_inicial == null ? (
          <button
            type="button"
            onClick={() => alterarMes(mes.id, { saldo_inicial: sugestao })}
            className="mt-1 text-left text-sm text-eucalipto underline-offset-2 hover:underline"
          >
            Pelo mês anterior, a previsão era {reais(sugestao)}. Usar
          </button>
        ) : (
          <p className="mt-1 text-sm text-textoSecundario">Quanto tinha na conta no dia 1</p>
        )}
      </div>
      <Numero
        rotulo="Saldo esperado hoje"
        valor={reais(t.saldo.esperadoHoje)}
        apoio="inicial + recebido − pago e lançado"
        tom={t.saldo.esperadoHoje < 0 ? 'text-terracota' : ''}
      />
      <Numero
        rotulo="Saldo no fim do mês"
        valor={reais(t.saldo.fimDoMes)}
        apoio="inicial + sobra prevista"
        tom={t.saldo.fimDoMes < 0 ? 'text-terracota' : ''}
      />
    </Cartao>
  )
}

function Resumo({ t }) {
  const { entradas, saidas, sobra, comprometido } = t
  return (
    <Cartao className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      <Numero
        rotulo="Entradas"
        valor={entradas.existem ? reais(entradas.efetivo) : '—'}
        apoio={entradas.existem ? `recebido ${reais(entradas.recebido)}` : 'nenhuma entrada'}
      />
      <Numero rotulo="Saídas" valor={reais(saidas.projetado)} apoio={`já saiu ${reais(saidas.lancado)}`} />
      <Numero
        rotulo="Sobra prevista"
        valor={entradas.existem ? reais(sobra) : '—'}
        apoio={comprometido != null ? `${comprometido}% da renda comprometida` : 'lance as entradas'}
        tom={entradas.existem ? (sobra >= 0 ? 'text-eucalipto' : 'text-terracota') : ''}
      />
      <Numero rotulo="Contas pagas" valor={`${t.contasPagas} de ${t.totalContas}`}>
        <BarraProgresso feitas={t.contasPagas} total={t.totalContas} className="mt-2" />
      </Numero>
    </Cartao>
  )
}

function NovoLancamento({ mes, am, lancar }) {
  const formas = formasDoMes(mes)
  const hoje = hojeLocal()
  const dataPadrao = hoje.startsWith(am) ? hoje : `${am}-01`
  const guardada = lerFormaGuardada()
  // A forma guardada é o id da conta do cartão, que muda a cada mês: procura pelo nome.
  const formaInicial =
    formas.find((f) => f.id === guardada || f.nome === guardada)?.id ?? formas.find((f) => f.id === 'pix_debito').id

  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [forma, setForma] = useState(formaInicial)
  const [data, setData] = useState(dataPadrao)
  const [aviso, setAviso] = useState('')

  async function enviar(e) {
    e.preventDefault()
    const v = lerValor(valor)
    if (v == null || Number.isNaN(v) || v <= 0) return setAviso('Valor não reconhecido. Use, por exemplo, 45,90')
    if (!descricao.trim()) return
    setAviso('')
    guardarForma(formas.find((f) => f.id === forma)?.nome ?? forma)
    await lancar(mes.id, { data: data.startsWith(am) ? data : dataPadrao, descricao, categoria, forma, valor: v })
    setValor('')
    setDescricao('')
  }

  return (
    <form onSubmit={enviar} className="grid grid-cols-2 gap-2 sm:grid-cols-12">
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        inputMode="decimal"
        placeholder="R$ 0,00"
        aria-label="Valor"
        className={`${classeCampo} tabular-nums sm:order-1 sm:col-span-3`}
      />
      <input
        type="date"
        value={data}
        min={`${am}-01`}
        max={deslocar(`${somarMeses(am, 1)}-01`, -1)}
        onChange={(e) => setData(e.target.value)}
        aria-label="Data"
        className={`${classeCampo} sm:order-3 sm:col-span-3`}
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="O que foi?"
        aria-label="Descrição"
        className={`${classeCampo} col-span-2 sm:order-2 sm:col-span-6`}
      />
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria" className={`${classeCampo} sm:order-4 sm:col-span-5`}>
        {CATEGORIAS.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <select value={forma} onChange={(e) => setForma(e.target.value)} aria-label="Forma de pagamento" className={`${classeCampo} sm:order-5 sm:col-span-4`}>
        {formas.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </select>
      <button type="submit" disabled={!valor.trim() || !descricao.trim()} className={`${classeBotao} col-span-2 sm:order-6 sm:col-span-3`}>
        <Plus size={16} aria-hidden /> Lançar
      </button>
      {aviso && <p className="col-span-2 text-sm text-terracota sm:order-7 sm:col-span-12">{aviso}</p>}
    </form>
  )
}

function Medidor({ rotulo, gasto, previsto, nota }) {
  return (
    <div className="min-w-0 rounded-xl bg-areia p-3">
      <p className="truncate font-interface text-xs font-semibold uppercase tracking-wide text-textoSecundario">{rotulo}</p>
      <p className="mt-1 font-semibold tabular-nums">
        {reais(gasto)}
        {previsto ? <span className="text-sm font-normal text-textoSecundario"> de {reais(previsto)}</span> : null}
      </p>
      <BarraGasto gasto={gasto} previsto={previsto} />
      <p className="mt-1 text-xs text-textoSecundario">{nota}</p>
    </div>
  )
}

function Lancamentos({ mes, am, t, lancar, removerLancamento }) {
  const cartoes = mes.contas.filter((c) => c.e_cartao)
  const mercado = mes.contas.find((c) => c.e_mercado)
  const nomeForma = (l) =>
    l.forma === 'cartao'
      ? cartoes.find((c) => c.id === l.conta_cartao_id)?.nome ?? 'Cartão'
      : FORMAS_FORA_DO_CARTAO.find((f) => f.id === l.forma).nome
  const porCategoria = Object.entries(
    mes.lancamentos.reduce((acc, l) => ({ ...acc, [l.categoria]: (acc[l.categoria] ?? 0) + l.valor }), {}),
  ).sort((a, b) => b[1] - a[1])

  return (
    <Cartao className="space-y-5">
      <div>
        <h2 className="text-xl">Lançamentos do mês</h2>
        <p className="text-sm text-textoSecundario">Cada gasto do dia a dia, na hora em que acontecer.</p>
      </div>

      <NovoLancamento key={`${mes.id}-${cartoes.length}`} mes={mes} am={am} lancar={lancar} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cartoes.map((c) => {
          const gasto = t.lancadoPorCartao[c.id] ?? 0
          const nota = c.previsto ? (gasto > c.previsto ? 'passou do previsto' : `sobram ${reais(c.previsto - gasto)}`) : 'já entra na fatura'
          return <Medidor key={c.id} rotulo={c.nome} gasto={gasto} previsto={c.previsto} nota={nota} />
        })}
        {mercado && <Medidor rotulo="Mercado" gasto={t.mercadoForaDoCartao} previsto={mercado.previsto} nota="fora do cartão" />}
        <Medidor rotulo="Avulsos" gasto={t.avulsos} nota="fora do cartão, somam nas saídas" />
      </div>

      {porCategoria.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Total por categoria">
          {porCategoria.map(([cat, v]) => (
            <li key={cat} className="rounded-full bg-nevoa px-3 py-1 text-sm">
              {cat} <strong className="tabular-nums">{reais(v)}</strong>
            </li>
          ))}
        </ul>
      )}

      {mes.lancamentos.length === 0 ? (
        <p className="text-sm text-textoSecundario">Nenhum gasto lançado neste mês.</p>
      ) : (
        <ul className="divide-y divide-borda">
          {mes.lancamentos.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-2.5">
              <span className="w-11 shrink-0 font-interface text-xs font-semibold text-textoSecundario">{diaCurto(l.data)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate">{l.descricao}</p>
                <p className="truncate text-xs text-textoSecundario">
                  {l.categoria} · {nomeForma(l)}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{reais(l.valor)}</span>
              <BotaoRemover nome={l.descricao} onRemover={() => removerLancamento(l.id)} />
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  )
}

// Aba "Mês": saldo, resumo e os lançamentos do dia a dia.
export default function MesFinancas() {
  const { mes, am, meses, abrirMes, alterarMes, lancar, removerLancamento } = useOutletContext()
  if (!mes) return <MesFechado am={am} abrirMes={abrirMes} />

  const t = calcularMes(mes)
  const sugestao = sugerirSaldoInicial(meses[somarMeses(am, -1)])

  return (
    <div className="space-y-5">
      <Saldo mes={mes} t={t} sugestao={sugestao} alterarMes={alterarMes} />
      <Resumo t={t} />
      {t.folgaCartoes && (
        <Cartao className="flex items-center gap-4 bg-nevoa">
          <PiggyBank size={28} aria-hidden className="shrink-0 text-eucalipto" />
          <p>
            {t.folgaCartoes.faturas > 1 ? 'As faturas vieram' : 'A fatura veio'}{' '}
            <strong>{reais(t.folgaCartoes.valor)}</strong> abaixo do previsto. Essa gordura dos cartões vai para a reserva.
          </p>
        </Cartao>
      )}
      <Lancamentos mes={mes} am={am} t={t} lancar={lancar} removerLancamento={removerLancamento} />
    </div>
  )
}
