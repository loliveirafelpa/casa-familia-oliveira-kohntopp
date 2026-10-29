import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import PainelDoDia from '../../components/PainelDoDia'
import { DIAS } from '../../data/plano'
import { dataDoDia } from '../../lib/agenda'
import { hojeLocal, segundaDaSemana } from '../../lib/datas'

// Um dia da semana atual (/semana/ter): para adiantar ou terminar a lista de outro dia.
export default function Dia() {
  const { slug } = useParams()
  const dia = DIAS.find((d) => d.slug === slug)
  if (!dia) return <Navigate to="/semana" replace />

  const hoje = hojeLocal()
  const data = dataDoDia(segundaDaSemana(hoje), dia)
  const rotulo = data === hoje ? 'Hoje' : data < hoje ? 'Já passou' : 'Ainda vem'

  return (
    <div className="space-y-4">
      <Link
        to="/semana"
        className="inline-flex items-center gap-1 rounded-full py-1 pr-3 font-interface text-sm font-semibold text-eucalipto hover:underline"
      >
        <ChevronLeft size={16} aria-hidden /> Semana
      </Link>
      <PainelDoDia key={data} data={data} rotuloData={rotulo} />
    </div>
  )
}
