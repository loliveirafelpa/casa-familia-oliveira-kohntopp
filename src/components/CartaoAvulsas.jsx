import { useState } from 'react'
import { CalendarPlus, Plus, X } from 'lucide-react'
import Cartao from './Cartao'
import LinhaTarefa from './LinhaTarefa'

// "Só neste dia": tarefas que não se repetem. Mostra as pendentes (com X para apagar) e o campo para criar.
export default function CartaoAvulsas({ pendentes, saindo, ehHoje, onConcluir, onAdicionar, onRemover }) {
  const [titulo, setTitulo] = useState('')

  function enviar(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    onAdicionar(titulo)
    setTitulo('')
  }

  return (
    <Cartao>
      <h2 className="flex items-center gap-2 text-xl sm:text-2xl">
        <CalendarPlus size={22} aria-hidden className="text-salvia" /> {ehHoje ? 'Só hoje' : 'Só neste dia'}
      </h2>
      {pendentes.length > 0 && (
        <ul className="mt-2">
          {pendentes.map((t) => (
            <LinhaTarefa
              key={t.id}
              tarefa={t}
              saindo={saindo.has(t.id)}
              onConcluir={() => onConcluir(t)}
              acessorio={
                <button
                  type="button"
                  onClick={() => onRemover(t.id)}
                  aria-label={`Apagar a tarefa ${t.titulo}`}
                  className="mt-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-textoSecundario hover:bg-areia hover:text-terracota"
                >
                  <X size={16} aria-hidden />
                </button>
              }
            />
          ))}
        </ul>
      )}
      <form onSubmit={enviar} className="mt-3 flex gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={ehHoje ? 'Algo a mais para fazer hoje?' : 'Algo a mais para fazer neste dia?'}
          aria-label="Nova tarefa só para este dia"
          className="min-w-0 flex-1 rounded-full border border-borda bg-areia px-4 py-2.5 focus:border-salvia focus:bg-branco focus:outline-none"
        />
        <button
          type="submit"
          disabled={!titulo.trim()}
          aria-label="Adicionar tarefa"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-eucalipto px-4 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro disabled:opacity-50"
        >
          <Plus size={16} aria-hidden /> <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>
    </Cartao>
  )
}
