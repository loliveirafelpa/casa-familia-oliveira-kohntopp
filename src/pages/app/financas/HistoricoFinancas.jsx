import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Cartao from '../../../components/Cartao'
import { classeBotao, classeBotaoLeve } from '../../../components/financas/Campos'
import { calcularMes, mesCurto, nomeDoMes, reais } from '../../../lib/financasCalculos'

const mil = (v) => `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`

// Barras: saídas do mês (projetadas). Traço: entradas. Tocar numa barra abre o mês.
// Cores do tema; barra e traço também se distinguem pela forma, e cada barra traz o valor escrito.
function Grafico({ dados, am, onAbrir }) {
  const [foco, setFoco] = useState(null)
  const max = Math.max(1, ...dados.map((d) => Math.max(d.saidas, d.entradas ?? 0)))
  const topo = Math.ceil(max / 5000) * 5000
  const L = 56
  const R = 8
  const T = 22
  const B = 30
  const H = 220
  const passo = 64
  const W = Math.max(320, L + R + dados.length * passo)
  const alturaPlot = H - T - B
  const y = (v) => T + alturaPlot - (v / topo) * alturaPlot
  const largura = 28

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Saídas e entradas por mês" className="font-interface">
          {[0, topo / 2, topo].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-borda" strokeWidth="1" />
              <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-textoSecundario text-xs">
                {v ? mil(v) : '0'}
              </text>
            </g>
          ))}
          {dados.map((d, i) => {
            const cx = L + passo * i + passo / 2
            const escolhido = d.am === am
            const topoBarra = y(d.saidas)
            return (
              <g
                key={d.am}
                onClick={() => onAbrir(d.am)}
                onMouseEnter={() => setFoco(d.am)}
                onMouseLeave={() => setFoco(null)}
                className="cursor-pointer"
              >
                {/* área de toque maior que a barra */}
                <rect x={cx - passo / 2} y={T} width={passo} height={alturaPlot + B} className="fill-transparent" />
                <path
                  d={`M${cx - largura / 2},${T + alturaPlot} V${topoBarra + 4} q0,-4 4,-4 H${cx + largura / 2 - 4} q4,0 4,4 V${T + alturaPlot} Z`}
                  className={escolhido ? 'fill-eucalipto' : 'fill-salvia'}
                />
                <text x={cx} y={topoBarra - 6} textAnchor="middle" className="fill-textoSecundario text-xs">
                  {mil(d.saidas)}
                </text>
                {d.entradas != null && (
                  <line
                    x1={cx - largura / 2 - 6}
                    x2={cx + largura / 2 + 6}
                    y1={y(d.entradas)}
                    y2={y(d.entradas)}
                    className="stroke-terracota"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}
                <text
                  x={cx}
                  y={H - 10}
                  textAnchor="middle"
                  className={`text-xs ${escolhido ? 'fill-eucalipto font-semibold' : 'fill-textoSecundario'}`}
                >
                  {mesCurto(d.am)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      {foco && (
        <p className="mt-2 text-sm" aria-live="polite">
          {(() => {
            const d = dados.find((x) => x.am === foco)
            return `${nomeDoMes(d.am)}: saídas ${reais(d.saidas)}${d.entradas != null ? `, entradas ${reais(d.entradas)}` : ''}`
          })()}
        </p>
      )}
    </div>
  )
}

function OrcamentoPadrao({ mes, am, salvarComoPadrao }) {
  const [confirmando, setConfirmando] = useState(false)
  const [feito, setFeito] = useState(false)
  return (
    <Cartao className="space-y-3">
      <h2 className="text-xl">Orçamento padrão</h2>
      <p className="text-sm text-textoSecundario">
        Cada mês novo começa com as contas e entradas do orçamento padrão, com os valores reais em branco.
      </p>
      {!mes ? (
        <p className="text-sm text-textoSecundario">Abra {nomeDoMes(am).toLowerCase()} para usá-lo como padrão.</p>
      ) : feito ? (
        <p className="text-sm font-semibold text-eucalipto">Orçamento padrão atualizado com {nomeDoMes(am).toLowerCase()}.</p>
      ) : confirmando ? (
        <div className="space-y-2">
          <p className="text-sm">
            O padrão passa a ser as contas e entradas de {nomeDoMes(am).toLowerCase()} (o previsto de cada uma; sem previsto, o
            valor real). Os meses já abertos não mudam.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={classeBotao}
              onClick={async () => {
                await salvarComoPadrao(mes.id)
                setConfirmando(false)
                setFeito(true)
              }}
            >
              Confirmar
            </button>
            <button type="button" className={classeBotaoLeve} onClick={() => setConfirmando(false)}>
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={classeBotaoLeve} onClick={() => setConfirmando(true)}>
          Usar {nomeDoMes(am).toLowerCase()} como orçamento padrão
        </button>
      )}
    </Cartao>
  )
}

// Aba "Histórico": saídas e entradas de cada mês aberto, e o orçamento padrão.
export default function HistoricoFinancas() {
  const { meses, mes, am, setAm, salvarComoPadrao } = useOutletContext()
  const navegar = useNavigate()
  const dados = Object.entries(meses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, m]) => {
      const t = calcularMes(m)
      return { am: chave, saidas: t.saidas.projetado, entradas: t.entradas.existem ? t.entradas.efetivo : null }
    })

  return (
    <div className="space-y-5">
      <Cartao className="space-y-3">
        <div>
          <h2 className="text-xl">Histórico</h2>
          <p className="text-sm text-textoSecundario">Toque numa barra para abrir o mês.</p>
        </div>
        {dados.length === 0 ? (
          <p className="text-sm text-textoSecundario">Nenhum mês aberto ainda.</p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-textoSecundario" aria-label="Legenda">
              <li className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm bg-salvia" aria-hidden /> Saídas do mês
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-0.5 w-4 rounded bg-terracota" aria-hidden /> Entradas
              </li>
            </ul>
            <Grafico
              dados={dados}
              am={am}
              onAbrir={(escolhido) => {
                setAm(escolhido)
                navegar('/financas')
              }}
            />
            <table className="sr-only">
              <caption>Saídas e entradas por mês</caption>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Saídas</th>
                  <th>Entradas</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((d) => (
                  <tr key={d.am}>
                    <td>{nomeDoMes(d.am)}</td>
                    <td>{reais(d.saidas)}</td>
                    <td>{reais(d.entradas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Cartao>
      <OrcamentoPadrao mes={mes} am={am} salvarComoPadrao={salvarComoPadrao} />
    </div>
  )
}
