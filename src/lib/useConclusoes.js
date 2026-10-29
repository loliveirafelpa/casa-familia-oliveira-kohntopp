import { useCallback, useEffect, useState } from 'react'
import { concluirTarefa, desfazerConclusao, listarConclusoes } from './conclusoesApi'
import { EVENTO_DADOS_ALTERADOS } from './armazenamento'

export const chave = (data, tarefaId) => `${data}|${tarefaId}`

// Tarefas feitas entre duas datas, como um Set de chaves (`null` enquanto carrega).
export function useConclusoes(inicio, fim) {
  const [feitas, setFeitas] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(() => {
    listarConclusoes(inicio, fim)
      .then((lista) => setFeitas(new Set(lista.map((c) => chave(c.data, c.tarefaId)))))
      .catch(setErro)
  }, [inicio, fim])

  useEffect(() => {
    carregar()
    window.addEventListener(EVENTO_DADOS_ALTERADOS, carregar)
    return () => window.removeEventListener(EVENTO_DADOS_ALTERADOS, carregar)
  }, [carregar])

  // Atualiza a tela na hora e grava em seguida; se a gravação falhar, volta ao que está guardado.
  const marcar = useCallback(
    async (data, tarefaId, feita) => {
      setFeitas((atual) => {
        const novo = new Set(atual)
        if (feita) novo.add(chave(data, tarefaId))
        else novo.delete(chave(data, tarefaId))
        return novo
      })
      try {
        await (feita ? concluirTarefa : desfazerConclusao)(data, tarefaId)
      } catch (e) {
        setErro(e)
        carregar()
      }
    },
    [carregar],
  )

  return { feitas, erro, marcar }
}
