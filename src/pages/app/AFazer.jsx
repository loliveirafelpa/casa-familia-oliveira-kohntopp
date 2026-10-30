import { useEffect, useState } from 'react'
import { ChevronDown, CircleCheck, Pencil, Plus, Undo2, X } from 'lucide-react'
import Cartao from '../../components/Cartao'
import LinhaTarefa from '../../components/LinhaTarefa'
import { useAfazeres } from '../../lib/useAfazeres'

const TEMPO_SAIDA = 300 // ms da animação antes de a coisa sumir da lista
const TEMPO_AVISO = 5000 // ms que o "Desfazer" fica na tela

function NovaCoisa({ onAdicionar }) {
  const [titulo, setTitulo] = useState('')

  function enviar(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    onAdicionar(titulo)
    setTitulo('')
  }

  return (
    <form onSubmit={enviar} className="flex gap-2">
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="O que precisamos fazer?"
        aria-label="Nova coisa para fazer"
        className="min-w-0 flex-1 rounded-full border border-borda bg-areia px-4 py-2.5 focus:border-salvia focus:bg-branco focus:outline-none"
      />
      <button
        type="submit"
        disabled={!titulo.trim()}
        aria-label="Adicionar"
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-eucalipto px-4 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro disabled:opacity-50"
      >
        <Plus size={16} aria-hidden /> <span className="hidden sm:inline">Adicionar</span>
      </button>
    </form>
  )
}

// Campo da anotação (telefone, horário, endereço…). Grava ao sair do campo ou apertar Enter.
function EditarAnotacao({ afazer, onSalvar, onFechar }) {
  const [texto, setTexto] = useState(afazer.observacao)
  const salvar = () => {
    onSalvar(afazer.id, texto)
    onFechar()
  }
  return (
    <input
      autoFocus
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={salvar}
      onKeyDown={(e) => e.key === 'Enter' && salvar()}
      placeholder="Ex.: telefone, horário, endereço"
      aria-label={`Anotação para ${afazer.titulo}`}
      className="w-full min-w-0 rounded-lg border border-borda bg-branco px-3 py-1.5 text-sm focus:border-salvia focus:outline-none"
    />
  )
}

const classeBotaoIcone =
  'mt-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-textoSecundario hover:bg-areia'

export default function AFazer() {
  const { afazeres, erro, adicionar, marcar, salvarObservacao, remover } = useAfazeres()
  const [saindo, setSaindo] = useState(() => new Set())
  const [anotando, setAnotando] = useState(null)
  const [ultima, setUltima] = useState(null)
  const [verFeitas, setVerFeitas] = useState(false)

  useEffect(() => {
    if (!ultima) return
    const t = setTimeout(() => setUltima(null), TEMPO_AVISO)
    return () => clearTimeout(t)
  }, [ultima])

  if (erro) return <p className="text-terracota">Não foi possível carregar a lista. Recarregue a página.</p>
  if (!afazeres) return null
  const { pendentes, feitas } = afazeres

  function concluir(afazer) {
    setSaindo((s) => new Set(s).add(afazer.id))
    setTimeout(() => {
      marcar(afazer.id, true)
      setSaindo((s) => {
        const novo = new Set(s)
        novo.delete(afazer.id)
        return novo
      })
      setUltima(afazer)
    }, TEMPO_SAIDA)
  }

  function desfazer(afazer) {
    marcar(afazer.id, false)
    setUltima(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl sm:text-4xl">Coisas a fazer</h1>
        <p className="mt-1 text-textoSecundario">O que surgir na semana e não tem dia certo. Fica aqui até alguém resolver.</p>
      </div>

      <Cartao>
        <NovaCoisa onAdicionar={adicionar} />
        {pendentes.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-eucalipto">
            <CircleCheck size={18} aria-hidden /> Nada pendente.
          </p>
        ) : (
          <ul className="mt-3">
            {pendentes.map((a) => (
              <LinhaTarefa
                key={a.id}
                tarefa={{ titulo: a.titulo, dica: anotando === a.id ? null : a.observacao }}
                saindo={saindo.has(a.id)}
                onConcluir={() => concluir(a)}
                acessorio={
                  <>
                    <button
                      type="button"
                      onClick={() => setAnotando(a.id)}
                      aria-label={`${a.observacao ? 'Editar a anotação de' : 'Anotar algo em'} ${a.titulo}`}
                      className={`${classeBotaoIcone} hover:text-eucalipto`}
                    >
                      <Pencil size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(a.id)}
                      aria-label={`Apagar ${a.titulo}`}
                      className={`${classeBotaoIcone} hover:text-terracota`}
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </>
                }
                abaixo={
                  anotando === a.id && (
                    <EditarAnotacao afazer={a} onSalvar={salvarObservacao} onFechar={() => setAnotando(null)} />
                  )
                }
              />
            ))}
          </ul>
        )}
      </Cartao>

      {feitas.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setVerFeitas((v) => !v)}
            aria-expanded={verFeitas}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-interface text-sm font-semibold text-eucalipto hover:bg-nevoa"
          >
            <ChevronDown size={16} aria-hidden className={`transition-transform ${verFeitas ? 'rotate-180' : ''}`} />
            Feitas ({feitas.length})
          </button>
          {verFeitas && (
            <ul className="mt-2 space-y-1">
              {feitas.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2 text-textoSecundario">
                  <CircleCheck size={18} aria-hidden className="shrink-0 text-salvia" />
                  <span className="min-w-0 flex-1 line-through decoration-salvia">{a.titulo}</span>
                  <button
                    type="button"
                    onClick={() => marcar(a.id, false)}
                    className="shrink-0 rounded-full px-2 py-1 font-interface text-xs font-semibold text-eucalipto hover:bg-nevoa"
                  >
                    Desmarcar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 px-3 text-xs text-textoSecundario">Aparecem aqui por 30 dias.</p>
        </div>
      )}

      {ultima && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-eucalipto px-4 py-3 text-branco shadow-cartao sm:bottom-8"
        >
          <CircleCheck size={18} aria-hidden className="shrink-0 text-salvia" />
          <span className="min-w-0 flex-1 truncate text-sm">Feito: {ultima.titulo}</span>
          <button
            type="button"
            onClick={() => desfazer(ultima)}
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-interface text-xs font-semibold text-nevoa hover:bg-branco/10"
          >
            <Undo2 size={14} aria-hidden /> Desfazer
          </button>
        </div>
      )}
    </div>
  )
}
