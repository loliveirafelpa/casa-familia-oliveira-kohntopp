import { rotuloFrequencia } from '../data/plano'

// Selo de frequência. Nas telas do dia, `soNaoSemanal` esconde o "Toda semana" (é o normal).
export default function SeloFrequencia({ tarefa, soNaoSemanal = false }) {
  if (soNaoSemanal && !tarefa.semanas) return null
  const mensal = tarefa.semanas?.length === 1
  const cor = !tarefa.semanas
    ? 'bg-areia text-textoSecundario'
    : mensal
      ? 'bg-terracotaFundo text-terracota'
      : 'bg-nevoa text-eucalipto'
  return (
    <span className={`inline-block shrink-0 rounded-full px-2 py-0.5 font-interface text-xs font-semibold ${cor}`}>
      {rotuloFrequencia(tarefa)}
    </span>
  )
}
