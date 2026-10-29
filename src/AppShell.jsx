import { NavLink, Outlet } from 'react-router-dom'
import { CalendarCheck, CalendarDays, House, ListChecks } from 'lucide-react'

const MENU = [
  { para: '/', rotulo: 'Hoje', icone: CalendarCheck, fim: true },
  { para: '/semana', rotulo: 'Semana', icone: CalendarDays },
  { para: '/plano', rotulo: 'Plano', icone: ListChecks },
]

// Cabeçalho com o nome da casa e o menu: no celular o menu fica embaixo, ao alcance do polegar.
export default function AppShell() {
  return (
    <div className="min-h-screen pb-24 sm:pb-12">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 pb-2 pt-6 sm:px-6 sm:pt-10">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-eucalipto text-areia">
            <House size={20} aria-hidden />
          </span>
          <div>
            <p className="font-titulo text-xl font-semibold leading-tight text-eucalipto">Casa em dia</p>
            <p className="font-interface text-xs text-textoSecundario">Família Oliveira Kohntopp</p>
          </div>
        </div>

        <nav
          aria-label="Menu"
          className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-borda bg-branco/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:static sm:gap-1 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
        >
          {MENU.map(({ para, rotulo, icone: Icone, fim }) => (
            <NavLink
              key={para}
              to={para}
              end={fim}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-full px-4 py-1.5 font-interface text-xs font-semibold transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:text-sm ${
                  isActive ? 'text-eucalipto sm:bg-eucalipto sm:text-branco' : 'text-textoSecundario hover:text-eucalipto'
                }`
              }
            >
              <Icone size={20} aria-hidden className="sm:h-4 sm:w-4" />
              {rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
