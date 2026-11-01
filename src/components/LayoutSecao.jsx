import { NavLink, Outlet } from 'react-router-dom'

// Abas de uma seção (Tarefas: Hoje/Semana/Plano; Compras: Lista/Mercado; Finanças) acima da tela escolhida.
// `children` aparece entre as abas e a tela (ex.: o seletor de mês das Finanças); `contexto` vai para useOutletContext.
export default function LayoutSecao({ abas, contexto, children }) {
  return (
    <div className="space-y-5">
      <nav aria-label="Seção" className="flex gap-1 overflow-x-auto rounded-full bg-nevoa p-1">
        {abas.map(({ para, rotulo, fim }) => (
          <NavLink
            key={para}
            to={para}
            end={fim}
            className={({ isActive }) =>
              `flex-1 whitespace-nowrap rounded-full px-4 py-2 text-center font-interface text-sm font-semibold transition-colors ${
                isActive ? 'bg-branco text-eucalipto shadow-cartao' : 'text-textoSecundario hover:text-eucalipto'
              }`
            }
          >
            {rotulo}
          </NavLink>
        ))}
      </nav>
      {children}
      <Outlet context={contexto} />
    </div>
  )
}
