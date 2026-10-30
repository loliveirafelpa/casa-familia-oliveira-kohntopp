import { useCallback, useEffect, useState } from 'react'
import * as api from './afazeresApi'
import { EVENTO_DADOS_ALTERADOS } from './armazenamento'

// "Coisas a fazer": `{ pendentes, feitas }` (`null` enquanto carrega). Cada ação grava e depois recarrega.
export function useAfazeres() {
  const [afazeres, setAfazeres] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(() => {
    api.listarAfazeres().then(setAfazeres).catch(setErro)
  }, [])

  useEffect(() => {
    carregar()
    window.addEventListener(EVENTO_DADOS_ALTERADOS, carregar)
    return () => window.removeEventListener(EVENTO_DADOS_ALTERADOS, carregar)
  }, [carregar])

  const executar = (acao) => async (...args) => {
    try {
      await acao(...args)
    } catch (e) {
      setErro(e)
    } finally {
      carregar()
    }
  }

  return {
    afazeres,
    erro,
    adicionar: executar(api.adicionarAfazer),
    marcar: executar(api.marcarAfazer),
    salvarObservacao: executar(api.salvarObservacaoAfazer),
    remover: executar(api.removerAfazer),
  }
}
