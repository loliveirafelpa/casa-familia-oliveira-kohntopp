import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, CreditCard, Plus } from 'lucide-react'
import Cartao from '../../../components/Cartao'
import {
  BotaoRemover,
  CampoDinheiro,
  classeBotao,
  classeCampo,
  classeRotulo,
} from '../../../components/financas/Campos'
import { MesFechado } from './FinancasLayout'
import { DIVISAO, GRUPOS } from '../../../data/financas'
import { calcularMes, lerValor, numero, r2, reais } from '../../../lib/financasCalculos'

const proximaOrdem = (linhas) => Math.max(0, ...linhas.map((l) => l.ordem)) + 1

// Diferença entre realizado e previsto: "+50,00" (gastou mais, terracota) ou "−30,00" (economizou).
function Diferenca({ previsto, realizado }) {
  if (previsto == null || realizado == null) return null
  const d = r2(realizado - previsto)
  if (d === 0) return null
  return (
    <span className={`font-interface text-xs font-semibold tabular-nums ${d > 0 ? 'text-terracota' : 'text-eucalipto'}`}>
      {d > 0 ? '+' : '−'}
      {numero(Math.abs(d))}
    </span>
  )
}

function LinhaConta({ conta, alterarConta, removerConta }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={() => alterarConta(conta.id, { pago: !conta.pago })}
        aria-pressed={conta.pago}
        aria-label={conta.pago ? `${conta.nome}: paga` : `Marcar ${conta.nome} como paga`}
        className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          conta.pago ? 'border-eucalipto bg-eucalipto text-branco' : 'border-salvia text-transparent hover:text-salvia'
        }`}
      >
        <Check size={15} strokeWidth={3} aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={conta.pago ? 'text-textoSecundario' : ''}>{conta.nome}</span>
          {conta.e_cartao && <CreditCard size={14} aria-label="fatura de cartão" className="text-salvia" />}
          {conta.entra_divisao && (
            <span className="rounded-full bg-nevoa px-2 py-0.5 font-interface text-xs font-semibold text-eucalipto">
              divisão
            </span>
          )}
          <Diferenca previsto={conta.previsto} realizado={conta.realizado} />
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-textoSecundario">Previsto</span>
            <CampoDinheiro
              valor={conta.previsto}
              rotulo={`Previsto de ${conta.nome}`}
              placeholder="—"
              onSalvar={(v) => alterarConta(conta.id, { previsto: v })}
            />
          </label>
          <label className="block">
            <span className="text-xs text-textoSecundario">Realizado</span>
            <CampoDinheiro
              valor={conta.realizado}
              rotulo={`Realizado de ${conta.nome}`}
              placeholder={numero(conta.previsto) || '0,00'}
              onSalvar={(v) => alterarConta(conta.id, { realizado: v })}
            />
          </label>
        </div>
      </div>
      <BotaoRemover nome={conta.nome} onRemover={() => removerConta(conta.id)} />
    </li>
  )
}

function NovaConta({ mes, adicionarConta }) {
  const [nome, setNome] = useState('')
  const [grupo, setGrupo] = useState('Outros')
  const [previsto, setPrevisto] = useState('')
  const [eCartao, setECartao] = useState(false)
  const [entraDivisao, setEntraDivisao] = useState(false)
  const [aviso, setAviso] = useState('')

  async function enviar(e) {
    e.preventDefault()
    const v = lerValor(previsto)
    if (Number.isNaN(v)) return setAviso('Valor não reconhecido. Use, por exemplo, 1.234,56')
    if (!nome.trim()) return
    setAviso('')
    await adicionarConta(mes.id, { nome, grupo, previsto: v, eCartao, entraDivisao, ordem: proximaOrdem(mes.contas) })
    setNome('')
    setPrevisto('')
    setECartao(false)
    setEntraDivisao(false)
  }

  return (
    <form onSubmit={enviar} className="space-y-2 rounded-xl bg-areia p-3">
      <p className={classeRotulo}>Nova conta</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Farmácia"
          aria-label="Nome da conta"
          className={`${classeCampo} col-span-2 bg-branco`}
        />
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)} aria-label="Grupo" className={`${classeCampo} bg-branco`}>
          {GRUPOS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <input
          value={previsto}
          onChange={(e) => setPrevisto(e.target.value)}
          inputMode="decimal"
          placeholder="Previsto R$"
          aria-label="Valor previsto"
          className={`${classeCampo} bg-branco tabular-nums`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={eCartao} onChange={(e) => setECartao(e.target.checked)} className="h-4 w-4 accent-eucalipto" />
          É fatura de cartão
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={entraDivisao}
            onChange={(e) => setEntraDivisao(e.target.checked)}
            className="h-4 w-4 accent-eucalipto"
          />
          Entra na divisão com a {DIVISAO.nome}
        </label>
        <button type="submit" disabled={!nome.trim()} className={`${classeBotao} ml-auto`}>
          <Plus size={16} aria-hidden /> Adicionar
        </button>
      </div>
      {aviso && <p className="text-sm text-terracota">{aviso}</p>}
    </form>
  )
}

function Saidas({ mes, t, alterarConta, removerConta, adicionarConta }) {
  const grupos = [...new Set([...GRUPOS, ...mes.contas.map((c) => c.grupo)])]
  return (
    <Cartao className="space-y-4">
      <div>
        <h2 className="text-xl">Saídas</h2>
        <p className="text-sm text-textoSecundario">Toque no ✓ quando pagar. Lance o valor que veio em “Realizado”.</p>
      </div>
      {mes.contas.length === 0 && <p className="text-sm text-textoSecundario">Nenhuma conta neste mês.</p>}
      {grupos.map((grupo) => {
        const contas = mes.contas.filter((c) => c.grupo === grupo)
        if (contas.length === 0) return null
        const subtotal = contas.reduce((s, c) => s + t.projetadoPorConta[c.id], 0)
        return (
          <section key={grupo}>
            <h3 className="flex items-baseline justify-between border-b border-borda pb-1 font-interface text-sm uppercase tracking-wide text-textoSecundario">
              <span>{grupo}</span>
              <span className="tabular-nums">{reais(subtotal)}</span>
            </h3>
            <ul className="divide-y divide-borda">
              {contas.map((c) => (
                <LinhaConta key={c.id} conta={c} alterarConta={alterarConta} removerConta={removerConta} />
              ))}
            </ul>
          </section>
        )
      })}
      <NovaConta mes={mes} adicionarConta={adicionarConta} />
    </Cartao>
  )
}

function Entradas({ mes, alterarEntrada, removerEntrada, adicionarEntrada }) {
  const [nome, setNome] = useState('')
  const [previsto, setPrevisto] = useState('')
  const [aviso, setAviso] = useState('')

  async function enviar(e) {
    e.preventDefault()
    const v = lerValor(previsto)
    if (Number.isNaN(v)) return setAviso('Valor não reconhecido. Use, por exemplo, 1.234,56')
    if (!nome.trim()) return
    setAviso('')
    await adicionarEntrada(mes.id, { nome, previsto: v, ordem: proximaOrdem(mes.entradas) })
    setNome('')
    setPrevisto('')
  }

  return (
    <Cartao className="space-y-4">
      <div>
        <h2 className="text-xl">Entradas</h2>
        <p className="text-sm text-textoSecundario">Salário, freelas, aluguel do studio…</p>
      </div>
      {mes.entradas.length === 0 && <p className="text-sm text-textoSecundario">Sem entradas neste mês.</p>}
      <ul className="divide-y divide-borda">
        {mes.entradas.map((en) => (
          <li key={en.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p>{en.nome}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs text-textoSecundario">Previsto</span>
                  <CampoDinheiro
                    valor={en.previsto}
                    rotulo={`Previsto de ${en.nome}`}
                    placeholder="—"
                    onSalvar={(v) => alterarEntrada(en.id, { previsto: v })}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-textoSecundario">Recebido</span>
                  <CampoDinheiro
                    valor={en.recebido}
                    rotulo={`Recebido de ${en.nome}`}
                    placeholder={numero(en.previsto) || '0,00'}
                    onSalvar={(v) => alterarEntrada(en.id, { recebido: v })}
                  />
                </label>
              </div>
            </div>
            <BotaoRemover nome={en.nome} onRemover={() => removerEntrada(en.id)} />
          </li>
        ))}
      </ul>
      <form onSubmit={enviar} className="flex flex-wrap gap-2 rounded-xl bg-areia p-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nova entrada"
          aria-label="Nome da entrada"
          className={`${classeCampo} min-w-[10rem] flex-1 bg-branco`}
        />
        <input
          value={previsto}
          onChange={(e) => setPrevisto(e.target.value)}
          inputMode="decimal"
          placeholder="Valor R$"
          aria-label="Valor previsto da entrada"
          className={`${classeCampo} w-32 flex-none bg-branco tabular-nums`}
        />
        <button type="submit" disabled={!nome.trim()} className={classeBotao}>
          <Plus size={16} aria-hidden /> Adicionar
        </button>
        {aviso && <p className="w-full text-sm text-terracota">{aviso}</p>}
      </form>
    </Cartao>
  )
}

function Divisao({ mes, t, alterarMes }) {
  const { divisao } = t
  const status =
    divisao.recebido == null
      ? 'Ainda não recebido. Conta como entrada prevista.'
      : divisao.falta > 0
        ? `Falta receber ${reais(divisao.falta)}`
        : 'Recebido por completo'
  return (
    <Cartao className="space-y-4">
      <div>
        <h2 className="text-xl">Contribuição da {DIVISAO.nome}</h2>
        <p className="text-sm text-textoSecundario">Metade das contas marcadas com “divisão”.</p>
      </div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={mes.divisao_ativa}
          onChange={(e) => alterarMes(mes.id, { divisao_ativa: e.target.checked })}
          className="h-5 w-5 accent-eucalipto"
        />
        A {DIVISAO.nome} vai ajudar com as contas neste mês
      </label>
      {divisao.ativa && (
        <>
          <ul className="divide-y divide-borda text-sm">
            {divisao.itens.map((i) => (
              <li key={i.contaId} className="flex justify-between gap-3 py-2">
                <span>
                  {i.nome} {i.previsto && <span className="text-xs text-textoSecundario">previsto</span>}
                </span>
                <span className="tabular-nums">{reais(i.valor)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 py-2 font-semibold">
              <span>Total dessas contas</span>
              <span className="tabular-nums">{reais(divisao.total)}</span>
            </li>
          </ul>
          <div className="grid gap-4 rounded-xl bg-nevoa p-4 sm:grid-cols-2">
            <div>
              <p className={classeRotulo}>Parte da {DIVISAO.nome}</p>
              <p className="mt-1 font-titulo text-2xl font-semibold tabular-nums text-eucalipto">{reais(divisao.parte)}</p>
            </div>
            <label className="block">
              <span className={classeRotulo}>Recebido dela</span>
              <CampoDinheiro
                valor={divisao.recebido}
                rotulo={`Recebido da ${DIVISAO.nome}`}
                placeholder={numero(divisao.parte)}
                onSalvar={(v) => alterarMes(mes.id, { divisao_recebido: v })}
                className="mt-1 bg-branco"
              />
              <span className="mt-1 block text-sm text-textoSecundario">{status}</span>
            </label>
          </div>
        </>
      )}
    </Cartao>
  )
}

function Anotacoes({ mes, alterarMes }) {
  const [texto, setTexto] = useState(mes.nota)
  useEffect(() => setTexto(mes.nota), [mes.nota])
  return (
    <Cartao className="space-y-3">
      <h2 className="text-xl">Anotações do mês</h2>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => texto !== mes.nota && alterarMes(mes.id, { nota: texto })}
        rows={3}
        placeholder="Algo fora do normal neste mês? Anote aqui."
        aria-label="Anotações do mês"
        className={`${classeCampo} resize-y`}
      />
    </Cartao>
  )
}

// Aba "Contas": saídas, entradas, a contribuição da Larissa e as anotações do mês.
export default function ContasFinancas() {
  const ctx = useOutletContext()
  const { mes, am, abrirMes } = ctx
  if (!mes) return <MesFechado am={am} abrirMes={abrirMes} />
  const t = calcularMes(mes)

  return (
    <div className="space-y-5">
      <Saidas mes={mes} t={t} {...ctx} />
      <Entradas mes={mes} {...ctx} />
      <Divisao mes={mes} t={t} alterarMes={ctx.alterarMes} />
      <Anotacoes key={mes.id} mes={mes} alterarMes={ctx.alterarMes} />
    </div>
  )
}
