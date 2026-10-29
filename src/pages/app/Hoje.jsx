import { SunMedium } from 'lucide-react'
import Cartao from '../../components/Cartao'
import PainelDoDia from '../../components/PainelDoDia'
import ResumoSemana from '../../components/ResumoSemana'
import { diaDoPlano } from '../../lib/agenda'
import { hojeLocal, segundaDaSemana } from '../../lib/datas'

// De segunda a sexta, a lista do dia. No fim de semana, folga — com o resumo da semana que passou.
export default function Hoje() {
  const hoje = hojeLocal()
  if (diaDoPlano(hoje)) return <PainelDoDia data={hoje} rotuloData="Hoje" />

  return (
    <div className="space-y-5">
      <Cartao className="flex items-center gap-4 bg-nevoa">
        <SunMedium size={32} aria-hidden className="shrink-0 text-eucalipto" />
        <div>
          <h1 className="text-2xl sm:text-3xl">Fim de semana livre</h1>
          <p className="text-textoSecundario">Sem cômodo hoje. Segunda a lista recomeça pela cozinha.</p>
        </div>
      </Cartao>
      <div>
        <h2 className="mb-3 text-xl">Como foi a semana</h2>
        <ResumoSemana segunda={segundaDaSemana(hoje)} hoje={hoje} />
      </div>
    </div>
  )
}
