// Catálogo inicial da lista de compras: as seções do mercado e os itens que a casa costuma comprar.
// Na primeira vez que a lista abre num aparelho, todos estes itens são copiados para lá. Depois, a cada abertura,
// entram os itens novos deste arquivo (menos os que a família apagou pelo app) e saem os de ITENS_RETIRADOS.
// A ordem de SECOES é a ordem em que aparecem na tela — mais tarde, pode virar a ordem dos corredores do mercado.
import { Apple, Beef, Croissant, CupSoda, Droplets, Milk, Package, SprayCan, Wheat } from 'lucide-react'

export const SECOES = [
  { id: 'hortifruti', nome: 'Hortifrúti', icone: Apple },
  { id: 'acougue', nome: 'Açougue', icone: Beef },
  { id: 'laticinios', nome: 'Laticínios e frios', icone: Milk },
  { id: 'padaria', nome: 'Padaria', icone: Croissant },
  { id: 'mercearia', nome: 'Básicos da despensa', icone: Wheat },
  { id: 'bebidas', nome: 'Bebidas', icone: CupSoda },
  { id: 'limpeza', nome: 'Limpeza', icone: SprayCan },
  { id: 'higiene', nome: 'Higiene', icone: Droplets },
  { id: 'outros', nome: 'Outros', icone: Package }, // itens adicionados à mão sem seção escolhida
]

const ITENS = {
  hortifruti: [
    'Banana', 'Maçã', 'Mamão', 'Laranja', 'Limão', 'Tomate', 'Cebola', 'Alho',
    'Batata', 'Cenoura', 'Abobrinha', 'Brócolis', 'Alface', 'Melancia', 'Couve-flor', 'Cheiro-verde',
    'Berinjela', 'Pimentão', 'Couve', 'Morango', 'Uva', 'Abóbora', 'Chuchu', 'Repolho', 'Rúcula', 'Pepino', 'Mandioquinha',
  ],
  acougue: ['Carne moída', 'Bife', 'Peito de frango', 'Coxa e sobrecoxa', 'Linguiça', 'Peixe'],
  laticinios: [
    'Leite', 'Iogurte', 'Manteiga', 'Margarina sem sal', 'Requeijão', 'Queijo muçarela', 'Presunto',
    'Peito de peru', 'Creme de leite', 'Ovos', 'Yakult',
  ],
  padaria: ['Pão francês', 'Pão de forma', 'Pão de hambúrguer', 'Torrada', 'Torta', 'Bolo ou sobremesa'],
  mercearia: [
    'Arroz', 'Feijão', 'Macarrão espaguete', 'Macarrão parafuso', 'Macarrão penne', 'Macarrão talharim',
    'Macarrão instantâneo', 'Molho de tomate', 'Molho shoyu', 'Maionese', 'Ketchup', 'Mostarda', 'Azeite', 'Óleo', 'Sal fino', 'Sal grosso',
    'Açúcar', 'Café', 'Toddy', 'Leite condensado', 'Farinha de trigo', 'Farinha Deusa', 'Fubá', 'Fermento químico', 'Aveia',
    'Chocolate', 'Sucrilhos', 'Vinagre', 'Atum', 'Sardinha', 'Milho em lata', 'Ervilha em lata', 'Temperos',
  ],
  bebidas: ['Água com gás', 'Água de coco', 'Suco', 'Refrigerante', 'Cerveja', 'Vinho'],
  limpeza: [
    'Detergente', 'Esponja', 'Sabão líquido roupas', 'Sabão líquido Bernardo', 'Amaciante', 'Desinfetante', 'Água sanitária',
    'Limpador multiuso', 'Limpador perfumado para o chão', 'Limpa-vidros', 'Álcool', 'Saco de lixo', 'Papel toalha',
  ],
  higiene: [
    'Papel higiênico', 'Sabonete', 'Shampoo', 'Condicionador', 'Creme dental', 'Escova de dente',
    'Fio dental', 'Desodorante',
  ],
}

// Id estável a partir da seção e do nome (ex.: "mercearia-molho-de-tomate").
const paraId = (secao, nome) =>
  `${secao}-${nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

// Itens que saíram do catálogo depois de já estarem nos aparelhos: são apagados da lista guardada.
// (Para incluir um item novo, basta acrescentá-lo acima — ele entra sozinho nos aparelhos.)
export const ITENS_RETIRADOS = [
  'laticinios-queijo-minas',
  'padaria-bisnaguinha',
  'mercearia-macarrao', // virou os tipos de macarrão
  'mercearia-sal', // virou sal fino e sal grosso
  'mercearia-biscoito', // trocado por chocolate
  'bebidas-agua-mineral', // trocada por água com gás
  'limpeza-sabao-para-roupa', // virou sabão líquido roupas e sabão líquido Bernardo
]

// Seções inteiras que saíram (a família compra tudo do bebê e das cachorras pela internet):
// todos os itens delas são apagados da lista guardada, inclusive os adicionados à mão.
export const SECOES_RETIRADAS = ['bebe', 'cachorras']

export const ITENS_INICIAIS = Object.entries(ITENS).flatMap(([secao, nomes]) =>
  nomes.map((nome) => ({ id: paraId(secao, nome), nome, secao })),
)
