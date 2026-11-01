// Listas fixas das Finanças. Mudar aqui muda o app (o banco não trava esses valores).
// Os cartões NÃO estão aqui: cada fatura é uma conta do mês marcada como cartão (e_cartao), e a forma de
// pagamento "cartão" de um lançamento aponta para essa conta.

// Ordem em que os grupos de saídas aparecem.
export const GRUPOS = ['Moradia', 'Studio', 'Dia a dia', 'Impostos', 'Outros']

export const CATEGORIAS = [
  'Mercado',
  'Restaurante e delivery',
  'Transporte',
  'Saúde',
  'Lazer',
  'Casa e manutenção',
  'Compras',
  'Assinaturas',
  'Impostos',
  'Outros',
]

// Formas de pagamento fora do cartão (no banco: forma = 'pix_debito' | 'dinheiro').
export const FORMAS_FORA_DO_CARTAO = [
  { id: 'pix_debito', nome: 'Pix ou débito' },
  { id: 'dinheiro', nome: 'Dinheiro' },
]

// Quem divide as contas marcadas com "entra na divisão", e com que fração.
export const DIVISAO = { nome: 'Larissa', fracao: 0.5 }
