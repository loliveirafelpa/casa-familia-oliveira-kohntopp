import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './AppShell'
import LayoutSecao from './components/LayoutSecao'
import Inicio from './pages/app/Inicio'
import Hoje from './pages/app/Hoje'
import Semana from './pages/app/Semana'
import Dia from './pages/app/Dia'
import Plano from './pages/app/Plano'
import Compras from './pages/app/Compras'
import Mercado from './pages/app/Mercado'

const ABAS_TAREFAS = [
  { para: '/tarefas', rotulo: 'Hoje', fim: true },
  { para: '/tarefas/semana', rotulo: 'Semana' },
  { para: '/tarefas/plano', rotulo: 'Plano' },
]

const ABAS_COMPRAS = [
  { para: '/compras', rotulo: 'Lista', fim: true },
  { para: '/compras/mercado', rotulo: 'No mercado' },
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Inicio />} />
          <Route path="tarefas" element={<LayoutSecao abas={ABAS_TAREFAS} />}>
            <Route index element={<Hoje />} />
            <Route path="semana" element={<Semana />} />
            <Route path="semana/:slug" element={<Dia />} />
            <Route path="plano" element={<Plano />} />
          </Route>
          <Route path="compras" element={<LayoutSecao abas={ABAS_COMPRAS} />}>
            <Route index element={<Compras />} />
            <Route path="mercado" element={<Mercado />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
