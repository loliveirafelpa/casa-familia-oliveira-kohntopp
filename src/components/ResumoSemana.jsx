import { Link } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import BarraProgresso from './BarraProgresso'
import { DIAS, COMODOS } from '../data/plano'
import { agendaDoDia, dataDoDia, tarefasDaAgenda } from '../lib/agenda'
import { chave, useConclusoes } from '../lib/useConclusoes'
import { deslocar, diaCurto } from '../lib/datas'

// Os cinco dias da semana que começa em `segunda`, com o progresso de cada um.
export default function ResumoSemana({ segunda, hoje }) {
  const { feitas } = useConclusoes(segunda, deslocar(segunda, 4))
  if (!feitas) return null

  return (
    <ul className="space-y-3">
      {DIAS.map((dia) => {
        const data = dataDoDia(segunda, dia)
        const tarefas = tarefasDaAgenda(agendaDoDia(data))
        const nFeitas = tarefas.filter((t) => feitas.has(chave(data, t.id))).length
        const pronto = nFeitas === tarefas.length
        const ehHoje = data === hoje
        return (
          <li key={dia.slug}>
            <Link
              to={`/tarefas/semana/${dia.slug}`}
              className={`block rounded-2xl bg-branco p-4 shadow-cartao transition-colors hover:bg-nevoa sm:p-5 ${
                ehHoje ? 'ring-2 ring-salvia' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-interface text-sm font-semibold text-textoSecundario">
                  {dia.nome} · {diaCurto(data)}
                  {ehHoje && <span className="ml-2 rounded-full bg-eucalipto px-2 py-0.5 text-xs text-branco">Hoje</span>}
                </p>
                <span className="flex shrink-0 items-center gap-1 font-interface text-sm font-semibold text-eucalipto">
                  {pronto && <CircleCheck size={16} aria-hidden />}
                  {nFeitas}/{tarefas.length}
                </span>
              </div>
              <p className="mt-1 font-titulo text-xl font-semibold text-eucalipto">
                {dia.comodos.map((id) => COMODOS[id].nome).join(' + ')}
              </p>
              <BarraProgresso feitas={nFeitas} total={tarefas.length} className="mt-3" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
