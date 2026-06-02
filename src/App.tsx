import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider } from '@/context/AuthContext'
import { RotasProvider } from '@/context/RotasContext'
import { AdminPage } from '@/pages/AdminPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'

/**
 * App principal com autenticação fechada (closed-loop).
 * Toda rota interna exige login; área admin exige perfil admin.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RotasProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<CadastroPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
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
          <Toaster />
        </RotasProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
