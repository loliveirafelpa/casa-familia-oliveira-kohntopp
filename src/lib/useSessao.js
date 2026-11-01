import { useCallback, useEffect, useState } from 'react'
import { entrarNaCasa, garantirSessao } from './sessaoApi'
import { ouvirMudancas } from './tempoReal'

// Situação do aparelho: 'carregando', 'semConexao' (não conseguiu falar com o banco), 'precisaCodigo'
// (primeira vez neste aparelho) ou 'dentro'. Dentro, liga os avisos ao vivo dos outros celulares.
export function useSessao() {
  const [situacao, setSituacao] = useState('carregando')

  const verificar = useCallback(async () => {
    setSituacao('carregando')
    try {
      await garantirSessao()
      setSituacao((await entrarNaCasa()) ? 'dentro' : 'precisaCodigo')
    } catch {
      setSituacao('semConexao')
    }
  }, [])

  useEffect(() => {
    verificar()
  }, [verificar])

  useEffect(() => {
    if (situacao === 'dentro') return ouvirMudancas()
  }, [situacao])

  // Devolve false se o código não confere (erros de conexão ou de excesso de tentativas sobem como exceção).
  const informarCodigo = useCallback(async (codigo) => {
    const casa = await entrarNaCasa(codigo)
    if (casa) setSituacao('dentro')
    return Boolean(casa)
  }, [])

  return { situacao, informarCodigo, tentarDeNovo: verificar }
}
