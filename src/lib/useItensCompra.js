import { useCallback, useEffect, useState } from 'react'
import * as api from './comprasApi'
import { EVENTO_DADOS_ALTERADOS } from './armazenamento'

// Itens da lista de compras (`null` enquanto carrega) e as ações sobre eles.
// Cada ação grava e depois recarrega a lista, para a tela sempre mostrar o que está guardado.
export function useItensCompra() {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(() => {
    api.listarItens().then(setItens).catch(setErro)
  }, [])

  useEffect(() => {
    carregar()
    window.addEventListener(EVENTO_DADOS_ALTERADOS, carregar)
    return () => window.removeEventListener(EVENTO_DADOS_ALTERADOS, carregar)
  }, [carregar])

  const executar = useCallback(
    (acao) =>
      async (...args) => {
        try {
          return await acao(...args)
        } catch (e) {
          setErro(e)
        } finally {
          carregar()
        }
      },
    [carregar],
  )

  return {
    itens,
    erro,
    marcarFalta: executar(api.marcarFalta),
    salvarObservacao: executar(api.salvarObservacao),
    alterarQuantidade: executar(api.alterarQuantidade),
    marcarCarrinho: executar(api.marcarCarrinho),
    concluirCompra: executar(api.concluirCompra),
    adicionarItem: executar(api.adicionarItem),
    removerItem: executar(api.removerItem),
  }
}
