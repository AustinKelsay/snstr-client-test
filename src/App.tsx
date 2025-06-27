/**
 * Main App component
 * Sets up the application shell with Redux store, error boundary, and basic layout
 */

import { Provider } from 'react-redux'
import { store } from '@/store'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import PageLayout from '@/components/layout/PageLayout'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <PageLayout header={<Header />} maxWidth="full">
            <div className="container mx-auto px-4 py-8">
              {/* Welcome section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Welcome to <span className="text-primary">snstr-client</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  A modern, Twitter-like Nostr client with a clean interface and powerful features.
                  Connect your extension to get started.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="min-w-[160px]">
                    Connect Extension
                  </Button>
                  <Button variant="outline" size="lg" className="min-w-[160px]">
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Status cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Extension Status</h3>
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-muted-foreground">Detecting...</span>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Authentication</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Not connected</span>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Relay Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Disconnected</span>
                  </div>
                </div>
              </div>

              {/* Feature showcase */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-8">Features Coming Soon</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="font-semibold mb-2">Lightning Fast</h3>
                    <p className="text-sm text-muted-foreground">
                      Optimized for performance with real-time updates
                    </p>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-3">🔒</div>
                    <h3 className="font-semibold mb-2">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encryption with NIP-07 extensions
                    </p>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="font-semibold mb-2">Decentralized</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to multiple relays for true decentralization
                    </p>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-3">💸</div>
                    <h3 className="font-semibold mb-2">Lightning Zaps</h3>
                    <p className="text-sm text-muted-foreground">
                      Send and receive Bitcoin payments seamlessly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PageLayout>
        </div>
      </ErrorBoundary>
    </Provider>
  )
}

export default App
