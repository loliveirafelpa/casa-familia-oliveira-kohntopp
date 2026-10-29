import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, Pencil, Plus, Search, ShoppingCart, X } from 'lucide-react'
import Cartao from '../../components/Cartao'
import { SECOES } from '../../data/catalogo'
import { normalizar } from '../../lib/comprasApi'
import { useItensCompra } from '../../lib/useItensCompra'

const ordemSecao = Object.fromEntries(SECOES.map((s, i) => [s.id, i]))
const porSecaoENome = (a, b) => ordemSecao[a.secao] - ordemSecao[b.secao] || a.nome.localeCompare(b.nome, 'pt-BR')
const nomeSecao = Object.fromEntries(SECOES.map((s) => [s.id, s.nome]))

const campo =
  'min-w-0 rounded-full border border-borda bg-areia px-4 py-2.5 focus:border-salvia focus:bg-branco focus:outline-none'

// Observação de um item da lista ("2 pacotes", "a marca de sempre"): grava ao sair do campo ou com Enter.
function Observacao({ item, onSalvar }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(item.observacao)

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => {
          setTexto(item.observacao)
          setEditando(true)
        }}
        className="flex items-center gap-1 text-left text-sm text-textoSecundario hover:text-eucalipto"
      >
        {item.observacao || (
          <>
            <Pencil size={12} aria-hidden /> observação
          </>
        )}
      </button>
    )
  }
  const salvar = () => {
    onSalvar(item.id, texto)
    setEditando(false)
  }
  return (
    <input
      autoFocus
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={salvar}
      onKeyDown={(e) => e.key === 'Enter' && salvar()}
      placeholder="Ex.: 2 pacotes, a marca de sempre"
      aria-label={`Observação para ${item.nome}`}
      className="mt-1 w-full min-w-0 rounded-lg border border-borda bg-branco px-2 py-1 text-sm focus:border-salvia focus:outline-none"
    />
  )
}

// Contador − 1 + da lista da semana. O item entra com 1; só mexe aqui quem precisa de mais.
function Quantidade({ item, onAlterar }) {
  const n = item.quantidade ?? 1
  const botao =
    'grid h-8 w-8 place-items-center rounded-full text-eucalipto hover:bg-nevoa disabled:text-borda disabled:hover:bg-transparent'
  return (
    <div className="flex shrink-0 items-center rounded-full border border-borda">
      <button type="button" onClick={() => onAlterar(item.id, n - 1)} disabled={n <= 1} aria-label={`Menos ${item.nome}`} className={botao}>
        <Minus size={14} aria-hidden />
      </button>
      <span className="w-6 text-center font-interface text-sm font-semibold" aria-live="polite" aria-label={`Quantidade: ${n}`}>
        {n}
      </span>
      <button type="button" onClick={() => onAlterar(item.id, n + 1)} disabled={n >= 99} aria-label={`Mais ${item.nome}`} className={botao}>
        <Plus size={14} aria-hidden />
      </button>
    </div>
  )
}

// Um item escrito à mão, fora do catálogo: entra direto na lista e fica guardado na seção escolhida.
function AdicionarManualmente({ itens, onAdicionar }) {
  const [nome, setNome] = useState('')
  const [secao, setSecao] = useState('outros')
  const jaExiste = nome.trim() && itens.some((i) => normalizar(i.nome) === normalizar(nome))

  function enviar(e) {
    e.preventDefault()
    if (!nome.trim()) return
    onAdicionar(nome, secao)
    setNome('')
  }

  return (
    <form onSubmit={enviar} className="mt-5 border-t border-borda pt-4">
      <label htmlFor="item-manual" className="font-interface text-sm font-semibold text-eucalipto">
        Adicionar manualmente
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="item-manual"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: vela de aniversário"
          className={`${campo} flex-1`}
        />
        <div className="flex gap-2">
          <select
            value={secao}
            onChange={(e) => setSecao(e.target.value)}
            aria-label="Seção do item"
            className={`${campo} flex-1 sm:flex-none`}
          >
            {SECOES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!nome.trim()}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-eucalipto px-4 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro disabled:opacity-50"
          >
            <Plus size={16} aria-hidden /> Adicionar
          </button>
        </div>
      </div>
      {jaExiste && (
        <p className="mt-2 text-sm text-textoSecundario">Esse item já existe — ao adicionar, ele só entra na lista.</p>
      )}
    </form>
  )
}

// Um item do catálogo: o botão inteiro marca e desmarca. Em modo de edição, apaga.
function BotaoItem({ item, editando, onAlternar, onApagar }) {
  const naLista = item.estado !== 'casa'
  const estilo = editando
    ? 'border-terracota/30 bg-terracotaFundo text-terracota hover:border-terracota'
    : naLista
      ? 'border-eucalipto bg-eucalipto text-branco hover:bg-eucaliptoEscuro'
      : 'border-borda bg-branco text-texto hover:border-salvia hover:bg-nevoa'
  return (
    <button
      type="button"
      onClick={editando ? onApagar : onAlternar}
      aria-pressed={editando ? undefined : naLista}
      aria-label={editando ? `Apagar ${item.nome} do catálogo` : undefined}
      className={`flex h-full w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm leading-tight transition-colors ${estilo}`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
          editando ? 'border-transparent' : naLista ? 'border-branco bg-branco text-eucalipto' : 'border-salvia'
        }`}
      >
        {editando ? <X size={14} aria-hidden /> : naLista && <Check size={12} strokeWidth={3} aria-hidden />}
      </span>
      <span className="min-w-0 break-words">{item.nome}</span>
    </button>
  )
}

// Durante a semana: no topo, a lista da semana; abaixo, tudo o que a casa costuma comprar, por seção.
export default function Compras() {
  const { itens, erro, marcarFalta, salvarObservacao, alterarQuantidade, adicionarItem, removerItem } = useItensCompra()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(false)

  if (erro) return <p className="text-terracota">Não foi possível carregar a lista. Recarregue a página.</p>
  if (!itens) return null

  const naLista = itens.filter((i) => i.estado !== 'casa').sort(porSecaoENome)
  const termo = normalizar(busca)
  const visiveis = termo ? itens.filter((i) => normalizar(i.nome).includes(termo)) : itens

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl sm:text-4xl">Lista de compras</h1>
        <p className="mt-1 text-textoSecundario">Acabou alguma coisa? Toque no item. No sábado, use “No mercado”.</p>
      </div>

      <Cartao>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl">Lista da semana ({naLista.length})</h2>
          {naLista.length > 0 && (
            <Link
              to="/compras/mercado"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-eucalipto px-4 py-2 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro"
            >
              <ShoppingCart size={16} aria-hidden /> No mercado
            </Link>
          )}
        </div>
        {naLista.length === 0 ? (
          <p className="mt-3 text-textoSecundario">Nada por enquanto. Toque nos itens aqui embaixo quando algo acabar.</p>
        ) : (
          <ul className="mt-3 divide-y divide-borda">
            {naLista.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">
                    {item.nome}
                    <span className="ml-2 text-xs text-textoSecundario">{nomeSecao[item.secao]}</span>
                    {item.estado === 'carrinho' && (
                      <span className="ml-2 rounded-full bg-nevoa px-2 py-0.5 font-interface text-xs font-semibold text-eucalipto">
                        no carrinho
                      </span>
                    )}
                  </p>
                  <Observacao key={item.observacao} item={item} onSalvar={salvarObservacao} />
                </div>
                <Quantidade item={item} onAlterar={alterarQuantidade} />
                <button
                  type="button"
                  onClick={() => marcarFalta(item.id, false)}
                  aria-label={`Tirar ${item.nome} da lista`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-textoSecundario hover:bg-areia hover:text-terracota"
                >
                  <X size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <AdicionarManualmente itens={itens} onAdicionar={adicionarItem} />
      </Cartao>

      <Cartao>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl">O que temos que comprar</h2>
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-interface text-sm font-semibold text-eucalipto hover:bg-nevoa"
          >
            {editando ? <Check size={14} aria-hidden /> : <Pencil size={14} aria-hidden />}
            {editando ? 'Pronto' : 'Editar itens'}
          </button>
        </div>
        <p className="mt-1 text-sm text-textoSecundario">
          {editando ? 'Toque num item para apagá-lo de vez.' : 'Toque para pôr na lista da semana; toque de novo para tirar.'}
        </p>

        <label className="mt-4 flex items-center gap-2 rounded-full border border-borda bg-areia px-4 py-2.5 focus-within:border-salvia focus-within:bg-branco">
          <Search size={16} aria-hidden className="shrink-0 text-textoSecundario" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar um item"
            aria-label="Procurar um item"
            className="w-full min-w-0 bg-transparent focus:outline-none"
          />
          {busca && (
            <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="text-textoSecundario">
              <X size={16} aria-hidden />
            </button>
          )}
        </label>

        {termo && visiveis.length === 0 && (
          <p className="mt-4 text-textoSecundario">
            Nenhum item com “{busca.trim()}”. Para incluir, use “Adicionar manualmente”, lá em cima.
          </p>
        )}

        {SECOES.map((secao) => {
          const daSecao = visiveis.filter((i) => i.secao === secao.id).sort(porSecaoENome)
          if (daSecao.length === 0) return null
          const Icone = secao.icone
          const marcados = daSecao.filter((i) => i.estado !== 'casa').length
          return (
            <section key={secao.id} className="mt-6">
              <h3 className="flex items-center gap-2 text-lg">
                <Icone size={18} aria-hidden className="shrink-0 text-salvia" />
                {secao.nome}
                {marcados > 0 && (
                  <span className="rounded-full bg-nevoa px-2 py-0.5 font-interface text-xs font-semibold text-eucalipto">
                    {marcados} na lista
                  </span>
                )}
              </h3>
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {daSecao.map((item) => (
                  <li key={item.id}>
                    <BotaoItem
                      item={item}
                      editando={editando}
                      onAlternar={() => marcarFalta(item.id, item.estado === 'casa')}
                      onApagar={() => removerItem(item.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </Cartao>
    </div>
  )
}
