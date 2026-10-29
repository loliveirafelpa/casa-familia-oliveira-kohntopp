// Datas locais da casa (não UTC), no formato AAAA-MM-DD.
const p2 = (n) => String(n).padStart(2, '0')
export const paraIso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`

export const hojeLocal = () => paraIso(new Date())

// Meio-dia evita surpresas com horário de verão.
function paraData(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d, 12)
}

// Soma `n` dias a uma data AAAA-MM-DD.
export function deslocar(iso, n) {
  const d = paraData(iso)
  d.setDate(d.getDate() + n)
  return paraIso(d)
}

// Dia da semana (0 = domingo, 1 = segunda…).
export const diaDaSemana = (iso) => paraData(iso).getDay()

// Segunda-feira da semana de `iso` (sábado e domingo ainda contam como a semana que acabou).
export const segundaDaSemana = (iso) => deslocar(iso, -((diaDaSemana(iso) + 6) % 7))

// Semana do mês em que o dia cai: dias 1–7 → 1ª, 8–14 → 2ª, 15–21 → 3ª, 22–28 → 4ª, 29–31 → 5ª.
export const semanaDoMes = (iso) => Math.ceil(paraData(iso).getDate() / 7)

const formatar = (opcoes) => (iso) => new Intl.DateTimeFormat('pt-BR', opcoes).format(paraData(iso))
export const diaEMes = formatar({ day: 'numeric', month: 'long' }) // "29 de outubro"
export const diaCurto = formatar({ day: '2-digit', month: '2-digit' }) // "29/10"
