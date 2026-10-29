// Identidade visual da Casa em dia: verde eucalipto sobre fundo areia, com terracota de destaque.
// Único lugar com cores e fontes do projeto: nada de hex solto em componentes.

export const cores = {
  eucalipto: '#2F5D50', // cor principal — títulos, botões, marcações
  eucaliptoEscuro: '#22463C', // hover de botões e textos de maior peso
  salvia: '#8DB5A0', // detalhes e barras de progresso (não usar como cor de texto sobre claro)
  nevoa: '#E6EEE9', // fundo claro esverdeado — áreas suaves, selos
  areia: '#F6F2EB', // fundo geral das telas
  branco: '#FFFFFF',
  texto: '#1E2A25', // texto principal
  textoSecundario: '#55635D', // legendas, datas, dicas
  borda: '#DDE3DD',
  terracota: '#A9542C', // destaques: tarefas mensais, aviso de dia em andamento
  terracotaFundo: '#F7E9DF',
}

export const fontes = {
  titulo: ['Fraunces', 'Georgia', 'serif'], // títulos, com um toque acolhedor
  corpo: ['Inter', 'system-ui', 'sans-serif'], // leitura confortável
  interface: ['"DM Sans"', 'system-ui', 'sans-serif'], // botões, menus, rótulos
}

// Sombra dos cartões, tingida de eucalipto (em vez de cinza neutro).
export const sombras = {
  cartao: '0 1px 2px rgba(47, 93, 80, 0.06), 0 12px 32px -18px rgba(47, 93, 80, 0.30)',
}

// As fontes são carregadas do Google Fonts no index.html — se trocar aqui, trocar lá também.
