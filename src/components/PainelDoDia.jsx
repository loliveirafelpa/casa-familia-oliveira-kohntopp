import { useEffect, useState } from 'react'
import { ChevronDown, CircleCheck, PartyPopper, Sparkles, Undo2 } from 'lucide-react'
import Cartao from './Cartao'
import BarraProgresso from './BarraProgresso'
import LinhaTarefa from './LinhaTarefa'
import CartaoAvulsas from './CartaoAvulsas'
import { agendaDoDia, tarefasDaAgenda } from '../lib/agenda'
import { chave, useConclusoes } from '../lib/useConclusoes'
import { useAvulsas } from '../lib/useAvulsas'
import { hojeLocal } from '../lib/datas'
import { diaEMes } from '../lib/datas'

const TEMPO_SAIDA = 300 // ms da animação antes de a tarefa sumir da lista
const TEMPO_AVISO = 5000 // ms que o "Desfazer" fica na tela

// A lista de um dia útil: rotina diária + cômodos do dia + tarefas avulsas ("Só hoje"). Ao marcar, a tarefa some e vai para "Feitas".
export default function PainelDoDia({ data, rotuloData }) {
  const agenda = agendaDoDia(data)
  const { feitas, erro, marcar } = useConclusoes(data, data)
  const { avulsas, adicionar, remover } = useAvulsas(data, data)
  const [saindo, setSaindo] = useState(() => new Set())
  const [ultima, setUltima] = useState(null)
  const [verFeitas, setVerFeitas] = useState(false)

  useEffect(() => {
    if (!ultima) return
    const t = setTimeout(() => setUltima(null), TEMPO_AVISO)
    return () => clearTimeout(t)
  }, [ultima])

  if (erro) return <p className="text-terracota">Não foi possível carregar as tarefas. Recarregue a página.</p>
  if (!feitas || !avulsas) return null

  const feita = (t) => feitas.has(chave(data, t.id))
  const todas = [...tarefasDaAgenda(agenda), ...avulsas]
  const totalFeitas = todas.filter(feita).length
  const tudoPronto = totalFeitas === todas.length

  function concluir(tarefa) {
    setSaindo((s) => new Set(s).add(tarefa.id))
    setTimeout(() => {
      marcar(data, tarefa.id, true)
      setSaindo((s) => {
        const novo = new Set(s)
        novo.delete(tarefa.id)
        return novo
      })
      setUltima(tarefa)
    }, TEMPO_SAIDA)
  }

  function desfazer(tarefa) {
    marcar(data, tarefa.id, false)
    setUltima(null)
  }

  const pendentes = (lista) => lista.filter((t) => !feita(t))
  const rotinaPendente = pendentes(agenda.rotina)

  return (
    <div className="space-y-5">
      <div>
        <p className="font-interface text-sm font-semibold text-textoSecundario">
          {rotuloData} · {agenda.dia.nome.toLowerCase()}, {diaEMes(data)}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{agenda.comodos.map((c) => c.nome).join(' + ')}</h1>
        <div className="mt-4 flex items-center gap-3">
          <BarraProgresso feitas={totalFeitas} total={todas.length} className="flex-1" />
          <span className="shrink-0 font-interface text-sm font-semibold text-eucalipto">
            {totalFeitas} de {todas.length}
          </span>
        </div>
      </div>

      {tudoPronto && (
        <Cartao className="flex items-center gap-4 bg-nevoa">
          <PartyPopper size={28} aria-hidden className="shrink-0 text-eucalipto" />
          <div>
            <h2 className="text-xl">Tudo pronto por hoje!</h2>
            <p className="text-textoSecundario">A casa agradece. Amanhã tem mais um cômodo.</p>
          </div>
        </Cartao>
      )}

      {rotinaPendente.length > 0 && (
        <Cartao>
          <h2 className="flex items-center gap-2 text-xl">
            <Sparkles size={20} aria-hidden className="text-salvia" /> Todo dia
          </h2>
          <ul className="mt-2">
            {rotinaPendente.map((t) => (
              <LinhaTarefa key={t.id} tarefa={t} saindo={saindo.has(t.id)} onConcluir={() => concluir(t)} />
            ))}
          </ul>
        </Cartao>
      )}

      {agenda.comodos.map((comodo) => {
        const lista = pendentes(comodo.tarefas)
        const Icone = comodo.icone
        return (
          <Cartao key={comodo.id}>
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl">
              <Icone size={22} aria-hidden className="text-salvia" /> {comodo.nome}
            </h2>
            {lista.length > 0 ? (
              <ul className="mt-2">
                {lista.map((t) => (
                  <LinhaTarefa key={t.id} tarefa={t} saindo={saindo.has(t.id)} onConcluir={() => concluir(t)} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-eucalipto">
                <CircleCheck size={18} aria-hidden /> Cômodo em dia.
              </p>
            )}
          </Cartao>
        )
      })}

      <CartaoAvulsas
        pendentes={pendentes(avulsas)}
        saindo={saindo}
        ehHoje={data === hojeLocal()}
        onConcluir={concluir}
        onAdicionar={(titulo) => adicionar(data, titulo)}
        onRemover={remover}
      />

      {totalFeitas > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setVerFeitas((v) => !v)}
            aria-expanded={verFeitas}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-interface text-sm font-semibold text-eucalipto hover:bg-nevoa"
          >
            <ChevronDown size={16} aria-hidden className={`transition-transform ${verFeitas ? 'rotate-180' : ''}`} />
            Feitas ({totalFeitas})
          </button>
          {verFeitas && (
            <ul className="mt-2 space-y-1">
              {todas.filter(feita).map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-2 text-textoSecundario">
                  <CircleCheck size={18} aria-hidden className="shrink-0 text-salvia" />
                  <span className="flex-1 line-through decoration-salvia">{t.titulo}</span>
                  <button
                    type="button"
                    onClick={() => marcar(data, t.id, false)}
                    className="shrink-0 rounded-full px-2 py-1 font-interface text-xs font-semibold text-eucalipto hover:bg-nevoa"
                  >
                    Desmarcar
                  </button>
                </li>
              ))}
            </ul>
          )}
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
