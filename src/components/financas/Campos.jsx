import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { lerValor, numero } from '../../lib/financasCalculos'

export const classeCampo =
  'w-full min-w-0 rounded-xl border border-borda bg-areia px-3 py-2 focus:border-salvia focus:bg-branco focus:outline-none'
export const classeBotao =
  'inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-eucalipto px-4 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro disabled:opacity-50'
export const classeBotaoLeve =
  'inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-eucalipto px-4 py-2.5 font-interface text-sm font-semibold text-eucalipto hover:bg-nevoa disabled:opacity-50'
export const classeRotulo = 'font-interface text-xs font-semibold uppercase tracking-wide text-textoSecundario'

// Campo de dinheiro: aceita "1.234,56", "45,90", "R$ 10". Grava ao sair do campo (ou Enter), só se mudou.
// Valor que não dá para ler volta ao anterior e mostra o aviso.
export function CampoDinheiro({ valor, onSalvar, rotulo, placeholder = '0,00', className = '' }) {
  const [texto, setTexto] = useState(numero(valor))
  const [invalido, setInvalido] = useState(false)
  const editando = useRef(false)

  useEffect(() => {
    if (!editando.current) setTexto(numero(valor))
  }, [valor])

  function salvar() {
    editando.current = false
    const v = lerValor(texto)
    if (Number.isNaN(v)) {
      setInvalido(true)
      setTexto(numero(valor))
      return
    }
    setInvalido(false)
    setTexto(numero(v))
    if (v !== valor) onSalvar(v)
  }

  return (
    <span className="block">
      <input
        value={texto}
        inputMode="decimal"
        aria-label={rotulo}
        placeholder={placeholder}
        onFocus={() => (editando.current = true)}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={salvar}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`${classeCampo} text-right tabular-nums ${invalido ? 'border-terracota' : ''} ${className}`}
      />
      {invalido && <span className="mt-1 block text-xs text-terracota">Use, por exemplo, 1.234,56</span>}
    </span>
  )
}

// Remover com dois toques: o primeiro pergunta "Remover?" por 3 segundos.
export function BotaoRemover({ nome, onRemover }) {
  const [armado, setArmado] = useState(false)

  useEffect(() => {
    if (!armado) return
    const t = setTimeout(() => setArmado(false), 3000)
    return () => clearTimeout(t)
  }, [armado])

  if (armado) {
    return (
      <button
        type="button"
        onClick={onRemover}
        className="shrink-0 rounded-full bg-terracotaFundo px-3 py-1.5 font-interface text-xs font-semibold text-terracota"
      >
        Remover?
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setArmado(true)}
      aria-label={`Remover ${nome}`}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-textoSecundario hover:bg-areia"
    >
      <X size={16} aria-hidden />
    </button>
  )
}

// Número grande com rótulo e uma linha de apoio.
export function Numero({ rotulo, valor, apoio, tom = '', children }) {
  return (
    <div className="min-w-0">
      <p className={classeRotulo}>{rotulo}</p>
      <p className={`mt-1 font-titulo text-xl font-semibold tabular-nums sm:text-2xl ${tom || 'text-texto'}`}>{valor}</p>
      {apoio && <p className="mt-0.5 text-sm text-textoSecundario">{apoio}</p>}
      {children}
    </div>
  )
}

// Barra "gasto de previsto": terracota quando passa do previsto.
export function BarraGasto({ gasto, previsto }) {
  if (!previsto) return null
  const pct = Math.min(100, Math.round((gasto / previsto) * 100))
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-nevoa" aria-hidden>
      <div className={`h-full rounded-full ${gasto > previsto ? 'bg-terracota' : 'bg-salvia'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
