import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in app tree:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-crash">
          <p>Что-то пошло не так. Попробуйте перезагрузить страницу.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
