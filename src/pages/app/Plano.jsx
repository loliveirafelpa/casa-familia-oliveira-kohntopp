import { Sparkles } from 'lucide-react'
import Cartao from '../../components/Cartao'
import SeloFrequencia from '../../components/SeloFrequencia'
import { COMODOS, DIAS, ROTINA_DIARIA } from '../../data/plano'

// O plano completo, para revisar e ajustar: cada dia, o motivo da escolha e todas as tarefas com a frequência.
export default function Plano() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl sm:text-4xl">O plano da casa</h1>
        <p className="mt-2 text-textoSecundario">
          Um cômodo por dia, de segunda a sexta. As tarefas mais pesadas aparecem a cada 15 dias ou uma vez por mês,
          espalhadas para nenhuma semana pesar mais que as outras.
        </p>
      </div>

      <Cartao>
        <h2 className="flex items-center gap-2 text-xl">
          <Sparkles size={20} aria-hidden className="text-salvia" /> Todo dia
        </h2>
        <p className="mt-1 text-sm text-textoSecundario">Pequenos hábitos para a casa não acumular entre um cômodo e outro.</p>
        <ul className="mt-3 space-y-2">
          {ROTINA_DIARIA.map((t) => (
            <li key={t.id}>{t.titulo}</li>
          ))}
        </ul>
      </Cartao>

      {DIAS.map((dia) => (
        <Cartao key={dia.slug}>
          <p className="font-interface text-sm font-semibold text-textoSecundario">{dia.nome}</p>
          <h2 className="mt-1 text-2xl">{dia.comodos.map((id) => COMODOS[id].nome).join(' + ')}</h2>
          <p className="mt-1 text-sm text-textoSecundario">{dia.porque}</p>

          {dia.comodos.map((id) => {
            const comodo = COMODOS[id]
            const Icone = comodo.icone
            return (
              <div key={id} className="mt-5">
                {dia.comodos.length > 1 && (
                  <h3 className="flex items-center gap-2 text-lg">
                    <Icone size={18} aria-hidden className="text-salvia" /> {comodo.nome}
                  </h3>
                )}
                <ul className="mt-2 divide-y divide-borda">
                  {comodo.tarefas.map((t) => (
                    <li key={t.id} className="flex items-start justify-between gap-3 py-2.5">
                      <span className="leading-snug">{t.titulo}</span>
                      <SeloFrequencia tarefa={t} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </Cartao>
      ))}
    </div>
  )
}
