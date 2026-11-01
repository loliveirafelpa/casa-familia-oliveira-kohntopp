// Quando alguém mexe em outro celular, o Supabase avisa (Realtime) e as telas recarregam o que mostram.
// Também recarrega ao voltar para o app (o celular pode ter derrubado a conexão em segundo plano).
import { supabase } from './supabaseClient'

export const EVENTO_DADOS_ALTERADOS = 'casa-em-dia-dados-alterados'
const TABELAS = [
  'conclusoes', 'tarefas_avulsas', 'afazeres', 'itens_compra', 'itens_apagados',
  'fin_meses', 'fin_contas', 'fin_entradas', 'fin_lancamentos', 'fin_orcamento_padrao',
]
const ESPERA = 300 // ms: uma compra concluída muda vários itens de uma vez, e basta recarregar uma vez

let temporizador = null
function avisar() {
  clearTimeout(temporizador)
  temporizador = setTimeout(() => window.dispatchEvent(new Event(EVENTO_DADOS_ALTERADOS)), ESPERA)
}

// Liga os avisos (depois do login). Devolve a função que desliga.
export function ouvirMudancas() {
  const canal = supabase.channel('casa')
  for (const table of TABELAS) canal.on('postgres_changes', { event: '*', schema: 'public', table }, avisar)
  canal.subscribe()

  const aoVoltar = () => document.visibilityState === 'visible' && avisar()
  document.addEventListener('visibilitychange', aoVoltar)

  return () => {
    document.removeEventListener('visibilitychange', aoVoltar)
    supabase.removeChannel(canal)
  }
}
