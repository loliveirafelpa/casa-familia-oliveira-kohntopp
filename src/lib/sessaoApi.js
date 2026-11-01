// Entrada sem login: o aparelho entra no Supabase como usuário anônimo (sem e-mail, sem senha) e a sessão fica
// guardada nele. Na primeira vez, a pessoa digita a palavra-código da casa; `entrar_na_casa` confere e a torna membro.
// Depois disso, o app abre direto. (Se os dados do navegador forem apagados, pede o código de novo.)
import { conferir, supabase } from './supabaseClient'

// Usa a sessão guardada no aparelho ou cria uma anônima.
export async function garantirSessao() {
  const { session } = conferir(await supabase.auth.getSession())
  if (session) return session
  return conferir(await supabase.auth.signInAnonymously()).session
}

// Mesmo jeito de escrever em todo aparelho: "Casa  Azul" = "casa azul", "Limão" = "limao".
export const normalizarCodigo = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Casa deste aparelho (null se ainda não entrou). Com `codigo`, tenta entrar.
export async function entrarNaCasa(codigo) {
  const args = codigo ? { codigo: normalizarCodigo(codigo) } : {}
  return conferir(await supabase.rpc('entrar_na_casa', args))
}
