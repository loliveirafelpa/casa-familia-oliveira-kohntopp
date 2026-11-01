import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Cartao from '../../../components/Cartao'
import LayoutSecao from '../../../components/LayoutSecao'
import { classeBotao } from '../../../components/financas/Campos'
import { useFinancas } from '../../../lib/useFinancas'
import { mesDe, nomeDoMes, somarMeses } from '../../../lib/financasCalculos'
import { hojeLocal } from '../../../lib/datas'

const ABAS = [
  { para: '/financas', rotulo: 'Mês', fim: true },
  { para: '/financas/contas', rotulo: 'Contas' },
  { para: '/financas/historico', rotulo: 'Histórico' },
]

function SeletorMes({ am, onMudar }) {
  const atual = mesDe(hojeLocal())
  const classeSeta = 'grid h-10 w-10 shrink-0 place-items-center rounded-full text-eucalipto hover:bg-branco'
  return (
    <div className="flex items-center justify-between gap-2">
      <button type="button" onClick={() => onMudar(somarMeses(am, -1))} aria-label="Mês anterior" className={classeSeta}>
        <ChevronLeft size={22} aria-hidden />
      </button>
      <div className="min-w-0 text-center">
        <h1 className="text-2xl sm:text-3xl">{nomeDoMes(am)}</h1>
        {am !== atual && (
          <button
            type="button"
            onClick={() => onMudar(atual)}
            className="font-interface text-xs font-semibold text-textoSecundario underline-offset-2 hover:underline"
          >
            Voltar para o mês atual
          </button>
        )}
      </div>
      <button type="button" onClick={() => onMudar(somarMeses(am, 1))} aria-label="Próximo mês" className={classeSeta}>
        <ChevronRight size={22} aria-hidden />
      </button>
    </div>
  )
}

// Finanças: carrega os meses e guarda o mês escolhido (vale para as três abas).
export default function FinancasLayout() {
  const financas = useFinancas()
  const [am, setAm] = useState(() => mesDe(hojeLocal()))

  if (financas.erro) return <p className="text-terracota">Não foi possível carregar as finanças. Recarregue a página.</p>
  if (!financas.meses) return null

  return (
    <LayoutSecao abas={ABAS} contexto={{ ...financas, am, setAm, mes: financas.meses[am] ?? null }}>
      <SeletorMes am={am} onMudar={setAm} />
    </LayoutSecao>
  )
}

// Mês ainda não aberto: um botão cria a partir do orçamento padrão.
export function MesFechado({ am, abrirMes }) {
  const [abrindo, setAbrindo] = useState(false)
  return (
    <Cartao className="space-y-3 text-center">
      <p className="text-textoSecundario">{nomeDoMes(am)} ainda não foi aberto.</p>
      <button
        type="button"
        disabled={abrindo}
        onClick={async () => {
          setAbrindo(true)
          await abrirMes(am)
          setAbrindo(false)
        }}
        className={classeBotao}
      >
        {abrindo ? 'Abrindo…' : 'Abrir o mês com o orçamento padrão'}
      </button>
    </Cartao>
  )
}
