import { useEffect, useRef, useState } from 'react'
import { Wallet } from 'lucide-react'
import { classeBotao, classeBotaoLeve, classeCampo } from './Campos'
import { useFinancas } from '../../lib/useFinancas'
import { formasDoMes, lerValor, mesDe, reais } from '../../lib/financasCalculos'
import { hojeLocal } from '../../lib/datas'

// Depois de concluir a compra no mercado: "quanto deu?" vira um lançamento de Mercado nas Finanças.
// A lista de compras não tem preços, por isso a pergunta.
export default function LancarCompra() {
  const { meses, abrirMes, lancar } = useFinancas()
  const hoje = hojeLocal()
  const am = mesDe(hoje)
  const mes = meses?.[am]
  const [valor, setValor] = useState('')
  const [forma, setForma] = useState('pix_debito')
  const [estado, setEstado] = useState('perguntando') // 'perguntando' | 'lancado' | 'dispensado'
  const [aviso, setAviso] = useState('')

  // O mês atual precisa estar aberto para ter as faturas dos cartões como opção (abre uma vez só).
  const abriu = useRef(false)
  useEffect(() => {
    if (!meses || meses[am] || abriu.current) return
    abriu.current = true
    abrirMes(am)
  }, [meses, am, abrirMes])

  if (!mes || estado === 'dispensado') return null
  if (estado === 'lancado') {
    return <p className="mt-3 text-sm font-semibold text-eucalipto">Lançado em Finanças: {reais(lerValor(valor))}</p>
  }

  const formas = formasDoMes(mes)

  async function enviar(e) {
    e.preventDefault()
    const v = lerValor(valor)
    if (v == null || Number.isNaN(v) || v <= 0) return setAviso('Valor não reconhecido. Use, por exemplo, 412,35')
    await lancar(mes.id, { data: hoje, descricao: 'Compra do mercado', categoria: 'Mercado', forma, valor: v })
    setEstado('lancado')
  }

  return (
    <form onSubmit={enviar} className="mt-4 space-y-2 border-t border-borda pt-4">
      <p className="flex items-center gap-2 font-semibold">
        <Wallet size={18} aria-hidden className="text-eucalipto" /> Quanto deu a compra?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-label="Valor da compra"
          className={`${classeCampo} bg-branco tabular-nums`}
        />
        <select value={forma} onChange={(e) => setForma(e.target.value)} aria-label="Forma de pagamento" className={`${classeCampo} bg-branco`}>
          {formas.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!valor.trim()} className={`${classeBotao} flex-1`}>
          Lançar em Finanças
        </button>
        <button type="button" onClick={() => setEstado('dispensado')} className={classeBotaoLeve}>
          Agora não
        </button>
      </div>
      {aviso && <p className="text-sm text-terracota">{aviso}</p>}
    </form>
  )
}
