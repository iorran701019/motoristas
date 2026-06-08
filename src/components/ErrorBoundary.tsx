import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Error Boundary global: captura erros de render e exibe um fallback amigável. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] erro capturado:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 text-lg font-semibold text-institucional-800">
              Algo deu errado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página. Se o problema
              persistir, contate o suporte.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
