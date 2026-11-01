import { useCallback, useEffect, useState } from 'react'
import * as api from './financasApi'
import { EVENTO_DADOS_ALTERADOS } from './tempoReal'

// Finanças: `meses` ({ 'AAAA-MM': mes }, null enquanto carrega) e as ações. Cada ação grava e depois recarrega.
export function useFinancas() {
  const [meses, setMeses] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(() => {
    api.carregarFinancas().then(setMeses).catch(setErro)
  }, [])

  useEffect(() => {
    carregar()
    window.addEventListener(EVENTO_DADOS_ALTERADOS, carregar)
    return () => window.removeEventListener(EVENTO_DADOS_ALTERADOS, carregar)
  }, [carregar])

  const executar =
    (acao) =>
    async (...args) => {
      try {
        return await acao(...args)
      } catch (e) {
        setErro(e)
      } finally {
        carregar()
      }
    }

  return {
    meses,
    erro,
    abrirMes: executar(api.abrirMes),
    alterarMes: executar(api.alterarMes),
    salvarComoPadrao: executar(api.salvarComoPadrao),
    adicionarConta: executar(api.adicionarConta),
    alterarConta: executar(api.alterarConta),
    removerConta: executar(api.removerConta),
    adicionarEntrada: executar(api.adicionarEntrada),
    alterarEntrada: executar(api.alterarEntrada),
    removerEntrada: executar(api.removerEntrada),
    lancar: executar(api.lancar),
    removerLancamento: executar(api.removerLancamento),
  }
}
