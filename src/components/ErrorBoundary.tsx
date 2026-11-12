import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AIR Lab App Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              !
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
              An unexpected error occurred while loading this view. You can reload the page or return to the home screen.
            </p>
            {this.state.error?.message && (
              <pre className="text-left bg-neutral-950 p-3 rounded-lg text-xs text-rose-400 overflow-x-auto mb-6 border border-neutral-800">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="#/"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.hash = '#/'
                }}
                className="px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

