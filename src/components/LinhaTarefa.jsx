import { Check } from 'lucide-react'
import SeloFrequencia from './SeloFrequencia'

// Uma tarefa a fazer: o círculo inteiro é o botão de "feito". `saindo` anima a saída da lista.
export default function LinhaTarefa({ tarefa, saindo, onConcluir }) {
  return (
    <li
      className={`transition-all duration-300 ${saindo ? 'translate-x-6 opacity-0' : 'translate-x-0 opacity-100'}`}
    >
      <button
        type="button"
        onClick={onConcluir}
        disabled={saindo}
        className="group flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-areia"
      >
        <span
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
            saindo ? 'border-eucalipto bg-eucalipto text-branco' : 'border-salvia text-transparent group-hover:text-salvia'
          }`}
        >
          <Check size={14} strokeWidth={3} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-snug">{tarefa.titulo}</span>
          {tarefa.dica && <span className="mt-0.5 block text-sm text-textoSecundario">{tarefa.dica}</span>}
        </span>
        <SeloFrequencia tarefa={tarefa} soNaoSemanal />
        <span className="sr-only">— marcar como feita</span>
      </button>
    </li>
  )
}
