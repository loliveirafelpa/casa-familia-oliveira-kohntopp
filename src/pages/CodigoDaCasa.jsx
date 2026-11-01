import { useState } from 'react'
import { House, KeyRound, WifiOff } from 'lucide-react'
import Cartao from '../components/Cartao'

const classeBotao =
  'w-full rounded-full bg-eucalipto px-4 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro disabled:opacity-50'

function Moldura({ children }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-eucalipto text-areia">
          <House size={20} aria-hidden />
        </span>
        <div>
          <p className="font-titulo text-xl font-semibold leading-tight text-eucalipto">Casa em dia</p>
          <p className="font-interface text-xs text-textoSecundario">Família Oliveira Kohntopp</p>
        </div>
      </div>
      <Cartao className="space-y-4">{children}</Cartao>
    </div>
  )
}

// Primeira vez no aparelho: a palavra-código da casa. Depois disso, o app abre direto.
export default function CodigoDaCasa({ onInformar }) {
  const [codigo, setCodigo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setOcupado(true)
    setErro('')
    try {
      if (!(await onInformar(codigo))) setErro('Código não confere. Confira com alguém da casa.')
    } catch (falha) {
      setErro(
        falha?.message === 'muitas tentativas'
          ? 'Muitas tentativas erradas. Espere uma hora e tente de novo.'
          : 'Sem conexão com o servidor. Confira a internet e tente de novo.',
      )
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Moldura>
      <h1 className="flex items-center gap-2 font-titulo text-2xl font-semibold text-texto">
        <KeyRound size={22} aria-hidden className="text-eucalipto" /> Código da casa
      </h1>
      <p className="text-textoSecundario">
        Só na primeira vez neste aparelho. Digite o código que a família combinou — depois o app abre direto.
      </p>
      <form onSubmit={enviar} className="space-y-3">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          autoCapitalize="none"
          autoComplete="off"
          aria-label="Código da casa"
          className="w-full min-w-0 rounded-full border border-borda bg-areia px-4 py-2.5 focus:border-salvia focus:bg-branco focus:outline-none"
        />
        <button type="submit" disabled={ocupado || !codigo.trim()} className={classeBotao}>
          {ocupado ? 'Conferindo…' : 'Entrar'}
        </button>
      </form>
      {erro && <p className="text-sm text-terracota">{erro}</p>}
    </Moldura>
  )
}

export function SemConexao({ onTentar }) {
  return (
    <Moldura>
      <h1 className="flex items-center gap-2 font-titulo text-2xl font-semibold text-texto">
        <WifiOff size={22} aria-hidden className="text-eucalipto" /> Sem conexão
      </h1>
      <p className="text-textoSecundario">Não foi possível falar com o servidor da casa. Confira a internet.</p>
      <button type="button" className={classeBotao} onClick={onTentar}>
        Tentar de novo
      </button>
    </Moldura>
  )
}
