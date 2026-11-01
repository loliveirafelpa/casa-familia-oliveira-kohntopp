// Único cliente do Supabase do app. Só a anon (publishable) key — nenhum segredo no frontend.
// Valores em .env.local (local) e nas variáveis de ambiente do Vercel (publicado).
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !chave) {
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ver .env.example).')
}

export const supabase = createClient(url, chave)

// Erro do Supabase vira exceção, para os hooks mostrarem a mensagem de erro de sempre.
export function conferir({ data, error }) {
  if (error) throw error
  return data
}
