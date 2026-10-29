// Armazenamento provisório: um objeto guardado no navegador (localStorage) deste aparelho.
// Enquanto o Supabase não entra, cada celular ou computador tem a sua própria lista de tarefas feitas.
// Os arquivos xxxApi.js leem e gravam aqui; ao conectar o Supabase, só o corpo deles muda — as telas continuam iguais.

const CHAVE = 'casa-em-dia-v1'
let memoria = null

// Quando outra aba grava, esta descarta a cópia em memória e avisa as telas.
export const EVENTO_DADOS_ALTERADOS = 'casa-em-dia-dados-alterados'
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== CHAVE) return
    memoria = null
    window.dispatchEvent(new Event(EVENTO_DADOS_ALTERADOS))
  })
}

function carregar() {
  if (memoria) return memoria
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) memoria = JSON.parse(salvo)
  } catch {
    // navegador sem armazenamento (aba anônima, bloqueio): segue só em memória
  }
  // Tabelas que ainda não existiam no aparelho entram vazias (`itensCompra: null` = catálogo ainda não criado).
  memoria = { conclusoes: [], itensCompra: null, itensApagados: [], ...memoria }
  return memoria
}

// Leitura: devolve uma cópia, para nenhuma tela alterar o armazenamento sem passar por `gravar`.
export function ler(tabela) {
  return structuredClone(carregar()[tabela])
}

export function gravar(alterar) {
  alterar(carregar())
  try {
    localStorage.setItem(CHAVE, JSON.stringify(memoria))
  } catch {
    // idem: sem armazenamento, os dados duram até recarregar a página
  }
}
