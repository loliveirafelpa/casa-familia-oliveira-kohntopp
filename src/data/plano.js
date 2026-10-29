// O plano de limpeza da casa: o que limpar em cada cômodo e em que dia da semana.
// É a sugestão inicial — para ajustar, basta mudar este arquivo (mais tarde, isso pode virar tela de edição).
//
// Frequência de cada tarefa, pelo campo `semanas` (semana do mês em que o dia cai: dias 1–7 = 1ª, 8–14 = 2ª…):
// - sem `semanas`: toda semana;
// - `semanas: [1, 3]` ou `[2, 4]`: a cada 15 dias;
// - `semanas: [n]`: uma vez por mês, na n-ésima semana.
// Na 5ª semana (dias 29 a 31) só aparecem as tarefas semanais: é a semana mais leve do mês.
// As tarefas mensais de cada cômodo estão espalhadas pelas semanas, para nenhum dia pesar mais que os outros.
// Os `id` ficam guardados junto com as tarefas feitas: não mudar o id de uma tarefa que já existe.
import { Baby, Bath, BedDouble, BookOpen, CookingPot, ShowerHead, Sofa, WashingMachine } from 'lucide-react'

// Pequenos hábitos de todo dia (segunda a sexta), para a casa não acumular entre um cômodo e outro.
export const ROTINA_DIARIA = [
  { id: 'rot-louca', titulo: 'Louça lavada e pia vazia antes de dormir' },
  { id: 'rot-bancada', titulo: 'Passar pano nas bancadas e no fogão depois do jantar' },
  { id: 'rot-lixo', titulo: 'Levar o lixo da cozinha' },
  { id: 'rot-lugar', titulo: 'Devolver ao lugar o que ficou espalhado pela casa', dica: '10 minutos, todo mundo junto' },
]

export const COMODOS = {
  cozinha: {
    nome: 'Cozinha',
    icone: CookingPot,
    tarefas: [
      { id: 'coz-bancadas', titulo: 'Limpar os dois balcões e o revestimento atrás da pia' },
      { id: 'coz-fogao', titulo: 'Limpar o fogão (grelhas, queimadores e botões)' },
      { id: 'coz-eletros', titulo: 'Limpar por fora os eletrodomésticos', dica: 'Geladeira, micro-ondas, cafeteira, airfryer…' },
      { id: 'coz-microondas', titulo: 'Limpar o micro-ondas por dentro' },
      { id: 'coz-geladeira-vencidos', titulo: 'Conferir a geladeira e descartar o que venceu' },
      { id: 'coz-pia', titulo: 'Desinfetar a pia, a torneira e o ralo' },
      { id: 'coz-chao', titulo: 'Varrer e passar pano no chão' },
      { id: 'coz-lixeira', titulo: 'Lavar a lixeira', semanas: [1, 3] },
      { id: 'coz-armarios', titulo: 'Limpar as portas e os puxadores dos armários', semanas: [2, 4] },
      { id: 'coz-geladeira-completa', titulo: 'Limpar a geladeira por dentro (prateleiras e gavetas)', semanas: [1] },
      { id: 'coz-forno', titulo: 'Limpar o forno por dentro', semanas: [2] },
      { id: 'coz-despensa', titulo: 'Organizar a despensa e conferir validades', semanas: [3] },
      { id: 'coz-coifa', titulo: 'Limpar a coifa ou o depurador e o filtro', semanas: [4] },
    ],
  },
  banheiroSuite: {
    nome: 'Banheiro da suíte',
    icone: ShowerHead,
    tarefas: [
      { id: 'bsu-vaso', titulo: 'Limpar o vaso sanitário por dentro e por fora' },
      { id: 'bsu-pia', titulo: 'Limpar pia, bancada, torneira e espelho' },
      { id: 'bsu-box', titulo: 'Lavar o box: vidro, azulejos e piso' },
      { id: 'bsu-chao', titulo: 'Passar pano no chão' },
      { id: 'bsu-toalhas', titulo: 'Trocar as toalhas de banho e de rosto' },
      { id: 'bsu-repor', titulo: 'Esvaziar o lixo e repor papel e sabonete' },
      { id: 'bsu-ralos', titulo: 'Limpar os ralos', semanas: [1, 3] },
      { id: 'bsu-tapete', titulo: 'Lavar o tapete do banheiro', semanas: [2, 4] },
      { id: 'bsu-armario', titulo: 'Organizar o armário e descartar produtos vencidos', semanas: [1] },
      { id: 'bsu-rejunte', titulo: 'Escovar os rejuntes', semanas: [3] },
    ],
  },
  banheiroSocial: {
    nome: 'Banheiro social e lavabo',
    icone: Bath,
    tarefas: [
      { id: 'bso-vaso', titulo: 'Limpar o vaso sanitário por dentro e por fora' },
      { id: 'bso-pia', titulo: 'Limpar pia, bancada, torneira e espelho' },
      { id: 'bso-box', titulo: 'Lavar o box: vidro, azulejos e piso' },
      { id: 'bso-chao', titulo: 'Passar pano no chão' },
      { id: 'bso-toalhas', titulo: 'Trocar a toalha de rosto das visitas' },
      { id: 'bso-repor', titulo: 'Esvaziar o lixo e repor papel e sabonete' },
      { id: 'bso-ralos', titulo: 'Limpar os ralos', semanas: [2, 4] },
      { id: 'bso-tapete', titulo: 'Lavar o tapete do banheiro', semanas: [1, 3] },
      { id: 'bso-armario', titulo: 'Organizar o armário e descartar produtos vencidos', semanas: [2] },
      { id: 'bso-rejunte', titulo: 'Escovar os rejuntes', semanas: [4] },
    ],
  },
  suite: {
    nome: 'Suíte do casal',
    icone: BedDouble,
    tarefas: [
      { id: 'sui-cama', titulo: 'Trocar a roupa de cama' },
      { id: 'sui-po', titulo: 'Tirar o pó dos criados-mudos, da cômoda e da poltrona' },
      { id: 'sui-trocador', titulo: 'Higienizar o trocador e repor fraldas, lenços e pomadas' },
      { id: 'sui-roupas', titulo: 'Guardar as roupas que ficaram fora do lugar' },
      { id: 'sui-chao', titulo: 'Aspirar e passar pano no chão, inclusive embaixo da cama' },
      { id: 'sui-poltrona', titulo: 'Aspirar a poltrona de amamentação', semanas: [1, 3] },
      { id: 'sui-colchao', titulo: 'Aspirar e virar o colchão', semanas: [1] },
      { id: 'sui-guarda-roupa', titulo: 'Organizar uma parte do guarda-roupa', semanas: [2] },
      { id: 'sui-luminarias', titulo: 'Limpar luminárias, interruptores e maçanetas', semanas: [3] },
      { id: 'sui-janelas', titulo: 'Limpar janelas e trilhos', semanas: [4] },
    ],
  },
  quartoBebe: {
    nome: 'Quarto do bebê',
    icone: Baby,
    tarefas: [
      { id: 'beb-lencol', titulo: 'Trocar o lençol do berço' },
      { id: 'beb-grades', titulo: 'Higienizar as grades do berço' },
      { id: 'beb-po', titulo: 'Tirar o pó dos móveis e das prateleiras' },
      { id: 'beb-roupas', titulo: 'Guardar as roupinhas que voltaram da lavanderia' },
      { id: 'beb-chao', titulo: 'Aspirar e passar pano no chão' },
      { id: 'beb-brinquedos', titulo: 'Lavar brinquedos e mordedores', semanas: [2, 4] },
      { id: 'beb-servem', titulo: 'Separar as roupas que já não servem', semanas: [1] },
      { id: 'beb-janelas', titulo: 'Limpar janelas e trilhos', semanas: [2] },
      { id: 'beb-guarda-roupa', titulo: 'Organizar uma seção do guarda-roupa embutido', semanas: [3] },
    ],
  },
  escritorio: {
    nome: 'Escritório',
    icone: BookOpen,
    tarefas: [
      { id: 'esc-mesa-organizar', titulo: 'Organizar a escrivaninha (papéis, cabos, canetas)' },
      { id: 'esc-mesa-limpar', titulo: 'Limpar a escrivaninha, o monitor, o teclado e o mouse' },
      { id: 'esc-cama', titulo: 'Arrumar a cama e trocar a roupa de cama se alguém dormiu' },
      { id: 'esc-chao', titulo: 'Aspirar e passar pano no chão' },
      { id: 'esc-lixo', titulo: 'Esvaziar a lixeira' },
      { id: 'esc-estante-1', titulo: 'Tirar o pó da estante 1 (livros e prateleiras)', semanas: [1] },
      { id: 'esc-estante-2', titulo: 'Tirar o pó da estante 2 (livros e prateleiras)', semanas: [2] },
      { id: 'esc-estante-3', titulo: 'Tirar o pó da estante 3 (livros e prateleiras)', semanas: [3] },
      { id: 'esc-papeis', titulo: 'Organizar papéis e documentos', semanas: [4] },
    ],
  },
  lavanderia: {
    nome: 'Lavanderia',
    icone: WashingMachine,
    tarefas: [
      { id: 'lav-tanque', titulo: 'Limpar o tanque e a bancada' },
      { id: 'lav-panos', titulo: 'Lavar os panos de chão e de limpeza' },
      { id: 'lav-estoque', titulo: 'Conferir o estoque de produtos e anotar o que comprar' },
      { id: 'lav-chao', titulo: 'Varrer e passar pano no chão' },
      { id: 'lav-maquina-fora', titulo: 'Limpar a máquina por fora e o compartimento de sabão', semanas: [1, 3] },
      { id: 'lav-maquina-ciclo', titulo: 'Fazer o ciclo de limpeza da máquina e limpar o filtro', semanas: [2] },
      { id: 'lav-armarios', titulo: 'Organizar os armários', semanas: [3] },
      { id: 'lav-varal', titulo: 'Limpar o varal', semanas: [4] },
    ],
  },
  sala: {
    nome: 'Sala de estar e jantar',
    icone: Sofa,
    tarefas: [
      { id: 'sal-po', titulo: 'Tirar o pó do rack, do buffet e dos objetos de decoração' },
      { id: 'sal-tv', titulo: 'Limpar a TV e os eletrônicos com pano seco' },
      { id: 'sal-sofa', titulo: 'Aspirar o sofá e afofar as almofadas' },
      { id: 'sal-mesa', titulo: 'Limpar a mesa de jantar e as cadeiras' },
      { id: 'sal-organizar', titulo: 'Organizar o que ficou fora do lugar' },
      { id: 'sal-chao', titulo: 'Aspirar e passar pano no chão' },
      { id: 'sal-embaixo', titulo: 'Aspirar embaixo do sofá e dos móveis', semanas: [2, 4] },
      { id: 'sal-vidros', titulo: 'Limpar janelas, portas de vidro e trilhos', semanas: [1] },
      { id: 'sal-almofadas', titulo: 'Lavar as capas das almofadas', semanas: [2] },
      { id: 'sal-gavetas', titulo: 'Organizar as gavetas do buffet e do rack', semanas: [3] },
      { id: 'sal-rodapes', titulo: 'Limpar rodapés, interruptores e maçanetas', semanas: [4] },
    ],
  },
}

// `numero` segue o getDay() do JavaScript (1 = segunda). `slug` é o pedaço da URL (/semana/seg).
export const DIAS = [
  {
    numero: 1,
    slug: 'seg',
    nome: 'Segunda-feira',
    comodos: ['cozinha'],
    porque: 'A cozinha é o que mais acumula no fim de semana: começar por ela tira o peso maior logo no início.',
  },
  {
    numero: 2,
    slug: 'ter',
    nome: 'Terça-feira',
    comodos: ['banheiroSuite', 'banheiroSocial'],
    porque: 'Os dois banheiros usam os mesmos produtos e o mesmo passo a passo: em sequência, rende mais.',
  },
  {
    numero: 3,
    slug: 'qua',
    nome: 'Quarta-feira',
    comodos: ['suite', 'quartoBebe'],
    porque: 'Os quartos juntos: a roupa de cama dos dois sai no mesmo dia e vai numa leva só para a máquina.',
  },
  {
    numero: 4,
    slug: 'qui',
    nome: 'Quinta-feira',
    comodos: ['escritorio', 'lavanderia'],
    porque: 'Dois cômodos de uso mais leve. As três estantes de livros entram em rodízio, uma por semana.',
  },
  {
    numero: 5,
    slug: 'sex',
    nome: 'Sexta-feira',
    comodos: ['sala'],
    porque: 'A sala por último deixa a casa arrumada para o fim de semana e para receber visitas.',
  },
]

export function rotuloFrequencia(tarefa) {
  if (!tarefa.semanas) return 'Toda semana'
  if (tarefa.semanas.length > 1) return 'A cada 15 dias'
  return `Mensal · ${tarefa.semanas[0]}ª semana`
}
