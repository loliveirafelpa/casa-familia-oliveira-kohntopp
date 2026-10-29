import { Link } from 'react-router-dom'
import { ChevronRight, ListChecks, ShoppingCart } from 'lucide-react'
import BarraProgresso from '../../components/BarraProgresso'
import { agendaDoDia, tarefasDaAgenda } from '../../lib/agenda'
import { chave, useConclusoes } from '../../lib/useConclusoes'
import { useItensCompra } from '../../lib/useItensCompra'
import { useAvulsas } from '../../lib/useAvulsas'
import { diaDaSemana, diaEMes, hojeLocal } from '../../lib/datas'

const SABADO = 6

function saudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

// Cartão grande da Home: ícone, título, um resumo e a seta para entrar.
function CartaoEntrada({ para, icone: Icone, titulo, children }) {
  return (
    <Link
      to={para}
      className="group flex flex-col gap-4 rounded-2xl bg-branco p-5 shadow-cartao transition-colors hover:bg-nevoa sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-eucalipto text-areia">
          <Icone size={24} aria-hidden />
        </span>
        <ChevronRight size={22} aria-hidden className="text-salvia transition-transform group-hover:translate-x-1" />
      </div>
      <div>
        <h2 className="text-2xl">{titulo}</h2>
        <div className="mt-1 text-textoSecundario">{children}</div>
      </div>
    </Link>
  )
}

function ResumoTarefas({ hoje }) {
  const agenda = agendaDoDia(hoje)
  const { feitas } = useConclusoes(hoje, hoje)
  const { avulsas } = useAvulsas(hoje, hoje)
  if (!agenda) return <p>Fim de semana livre.</p>
  if (!feitas || !avulsas) return null
  const tarefas = [...tarefasDaAgenda(agenda), ...avulsas]
  const nFeitas = tarefas.filter((t) => feitas.has(chave(hoje, t.id))).length
  return (
    <>
      <p>
        Hoje: {agenda.comodos.map((c) => c.nome).join(' + ')} · {nFeitas} de {tarefas.length} feitas
      </p>
      <BarraProgresso feitas={nFeitas} total={tarefas.length} className="mt-3" />
    </>
  )
}

function ResumoCompras({ diaDeMercado }) {
  const { itens } = useItensCompra()
  if (!itens) return null
  const n = itens.filter((i) => i.estado !== 'casa').length
  const quantos = n === 0 ? 'Nada' : n === 1 ? '1 item' : `${n} itens`
  return (
    <>
      <p>{diaDeMercado ? 'Hoje é dia de mercado!' : 'O mercado é no sábado.'}</p>
      <p className="mt-1 font-interface text-sm font-semibold text-eucalipto">{quantos} para comprar</p>
    </>
  )
}

export default function Inicio() {
  const hoje = hojeLocal()
  const diaDeMercado = diaDaSemana(hoje) === SABADO

  return (
    <div className="space-y-6">
      <div>
        <p className="font-interface text-sm font-semibold text-textoSecundario">{diaEMes(hoje)}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{saudacao()}!</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CartaoEntrada para="/tarefas" icone={ListChecks} titulo="Tarefas de casa">
          <ResumoTarefas hoje={hoje} />
        </CartaoEntrada>
        <CartaoEntrada para={diaDeMercado ? '/compras/mercado' : '/compras'} icone={ShoppingCart} titulo="Lista de compras">
          <ResumoCompras diaDeMercado={diaDeMercado} />
        </CartaoEntrada>
      </div>
    </div>
  )
}
