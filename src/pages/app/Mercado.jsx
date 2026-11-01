import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, PartyPopper, ShoppingBasket } from 'lucide-react'
import Cartao from '../../components/Cartao'
import BarraProgresso from '../../components/BarraProgresso'
import { SECOES } from '../../data/catalogo'
import { useItensCompra } from '../../lib/useItensCompra'
import LancarCompra from '../../components/financas/LancarCompra'

const plural = (n, um, varios) => (n === 1 ? `1 ${um}` : `${n} ${varios}`)

// No mercado: só o que falta, por seção. Um toque põe no carrinho (riscado); "Concluir compra" devolve o
// carrinho para "em casa" e deixa o que não foi encontrado na lista da semana seguinte.
export default function Mercado() {
  const { itens, erro, marcarCarrinho, concluirCompra } = useItensCompra()
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState(null)

  if (erro) return <p className="text-terracota">Não foi possível carregar a lista. Recarregue a página.</p>
  if (!itens) return null

  const lista = itens.filter((i) => i.estado !== 'casa')
  const noCarrinho = lista.filter((i) => i.estado === 'carrinho').length
  const ficam = lista.length - noCarrinho

  async function concluir() {
    const comprados = await concluirCompra()
    setResultado({ comprados, ficaram: ficam })
    setConfirmando(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl sm:text-4xl">No mercado</h1>
        {lista.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <BarraProgresso feitas={noCarrinho} total={lista.length} className="flex-1" />
            <span className="shrink-0 font-interface text-sm font-semibold text-eucalipto">
              {noCarrinho} de {lista.length} no carrinho
            </span>
          </div>
        )}
      </div>

      {resultado && (
        <Cartao className="bg-nevoa">
          <div className="flex items-center gap-4">
            <PartyPopper size={28} aria-hidden className="shrink-0 text-eucalipto" />
            <div>
              <h2 className="text-xl">Compra concluída!</h2>
              <p className="text-textoSecundario">
                {plural(resultado.comprados, 'item reabastecido', 'itens reabastecidos')}.
                {resultado.ficaram > 0 &&
                  ` ${plural(resultado.ficaram, 'item ficou', 'itens ficaram')} na lista para a próxima semana.`}
              </p>
            </div>
          </div>
          <LancarCompra />
        </Cartao>
      )}

      {lista.length === 0 && !resultado && (
        <Cartao className="flex items-center gap-4">
          <ShoppingBasket size={28} aria-hidden className="shrink-0 text-salvia" />
          <p className="text-textoSecundario">
            A lista está vazia. Durante a semana, marque o que acabar em{' '}
            <Link to="/compras" className="font-semibold text-eucalipto underline">
              Lista
            </Link>
            .
          </p>
        </Cartao>
      )}

      {SECOES.map((secao) => {
        const daSecao = lista
          .filter((i) => i.secao === secao.id)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        if (daSecao.length === 0) return null
        const Icone = secao.icone
        return (
          <Cartao key={secao.id}>
            <h2 className="flex items-center gap-2 text-xl">
              <Icone size={20} aria-hidden className="text-salvia" /> {secao.nome}
            </h2>
            <ul className="mt-2">
              {daSecao.map((item) => {
                const pegou = item.estado === 'carrinho'
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => marcarCarrinho(item.id, !pegou)}
                      aria-pressed={pegou}
                      className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-areia"
                    >
                      <span
                        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                          pegou ? 'border-eucalipto bg-eucalipto text-branco' : 'border-salvia text-transparent'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block leading-snug ${pegou ? 'text-textoSecundario line-through decoration-salvia' : ''}`}>
                          {(item.quantidade ?? 1) > 1 && (
                            <span className="mr-1.5 font-interface font-bold text-eucalipto">{item.quantidade}×</span>
                          )}
                          {item.nome}
                        </span>
                        {item.observacao && <span className="block text-sm text-textoSecundario">{item.observacao}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Cartao>
        )
      })}

      {lista.length > 0 && (
        <div className="sticky bottom-24 z-10 rounded-2xl bg-branco p-4 shadow-cartao sm:bottom-4">
          {confirmando ? (
            <div className="space-y-3">
              <p className="text-sm">
                {plural(noCarrinho, 'item volta', 'itens voltam')} para “em casa”.
                {ficam > 0 && ` ${plural(ficam, 'item não encontrado continua', 'itens não encontrados continuam')} na lista para a próxima semana.`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={concluir}
                  className="flex-1 rounded-full bg-eucalipto px-5 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="rounded-full border border-eucalipto px-5 py-2.5 font-interface text-sm font-semibold text-eucalipto hover:bg-nevoa"
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              disabled={noCarrinho === 0}
              className="w-full rounded-full bg-eucalipto px-5 py-2.5 font-interface text-sm font-semibold text-branco hover:bg-eucaliptoEscuro disabled:opacity-50"
            >
              {noCarrinho === 0 ? 'Toque nos itens conforme pegar' : 'Concluir compra'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
