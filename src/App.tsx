import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'
import { RotasProvider } from '@/context/RotasContext'
import { CadastroPage } from '@/pages/CadastroPage'
import { DashboardPage } from '@/pages/DashboardPage'

/**
 * App principal — rotas preparadas para auth futura.
 * Rotas protegidas podem ser envolvidas em <ProtectedRoute> posteriormente.
 */
function App() {
  return (
    <BrowserRouter>
      <RotasProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CadastroPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </RotasProvider>
    </BrowserRouter>
  )
}

export default App
