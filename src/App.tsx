import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider } from '@/context/AuthContext'
import { RotasProvider } from '@/context/RotasContext'
import { CadastrosProvider } from '@/context/CadastrosContext'
import { AdminPage } from '@/pages/AdminPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { CadastrosPage } from '@/pages/CadastrosPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { RelatorioPage } from '@/pages/RelatorioPage'

/**
 * App principal com autenticação fechada (closed-loop).
 * Toda rota interna exige login; área admin exige perfil admin.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  {/* Providers de dados DENTRO do gate: só montam com sessão
                      autenticada, evitando o fetch anon (0 linhas) do boot. */}
                  <CadastrosProvider>
                    <RotasProvider>
                      <AppLayout />
                    </RotasProvider>
                  </CadastrosProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<CadastroPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cadastros" element={<CadastrosPage />} />
              <Route path="/relatorio" element={<RelatorioPage />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
