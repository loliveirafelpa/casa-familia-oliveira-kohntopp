import { useCallback, useEffect, useState } from 'react'
import { adicionarAvulsa, listarAvulsas, removerAvulsa } from './avulsasApi'
import { EVENTO_DADOS_ALTERADOS } from './tempoReal'

// Tarefas avulsas entre duas datas (`null` enquanto carrega). Cada ação grava e depois recarrega.
export function useAvulsas(inicio, fim) {
  const [avulsas, setAvulsas] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(() => {
    listarAvulsas(inicio, fim).then(setAvulsas).catch(setErro)
  }, [inicio, fim])

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

  return { avulsas, erro, adicionar: executar(adicionarAvulsa), remover: executar(removerAvulsa) }
}

// Avulsas de uma data, a partir da lista de um intervalo.
export const avulsasDoDia = (avulsas, data) => avulsas.filter((t) => t.data === data)
