import ResumoSemana from '../../components/ResumoSemana'
import { deslocar, diaEMes, hojeLocal, segundaDaSemana } from '../../lib/datas'

export default function Semana() {
  const hoje = hojeLocal()
  const segunda = segundaDaSemana(hoje)
  return (
    <div className="space-y-5">
      <div>
        <p className="font-interface text-sm font-semibold text-textoSecundario">
          De {diaEMes(segunda)} a {diaEMes(deslocar(segunda, 4))}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl">Esta semana</h1>
      </div>
      <ResumoSemana segunda={segunda} hoje={hoje} />
    </div>
  )
}
