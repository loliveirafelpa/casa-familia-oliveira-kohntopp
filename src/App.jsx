import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './AppShell'
import Hoje from './pages/app/Hoje'
import Semana from './pages/app/Semana'
import Dia from './pages/app/Dia'
import Plano from './pages/app/Plano'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Hoje />} />
          <Route path="semana" element={<Semana />} />
          <Route path="semana/:slug" element={<Dia />} />
          <Route path="plano" element={<Plano />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
