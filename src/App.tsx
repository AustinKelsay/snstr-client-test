/**
 * Main App component
 * Sets up the application shell with Redux store, error boundary, and basic layout
 * Implements the cypherpunk dark theme system with proper visual hierarchy
 */

import { Provider } from 'react-redux'
import { store } from '@/store'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import PageLayout from '@/components/layout/PageLayout'
import Header from '@/components/layout/Header'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <PageLayout header={<Header />} maxWidth="full">
            <div className="container-padding section-spacing">
              {/* Welcome Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Welcome to <span style={{ color: 'var(--accent-primary)' }}>snstr-client</span>
                </h1>
                <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  A modern, Twitter-like Nostr client with a clean interface and powerful features.
                  <br />
                  <span className="text-technical">Connect your extension to get started.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="btn-base btn-primary btn-lg min-w-[180px]">
                    Connect Extension
                  </button>
                  <button className="btn-base btn-secondary btn-lg min-w-[180px]">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {/* Extension Status Card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Extension Status
                    </h3>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--warning)' }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="loading-spinner w-4 h-4" />
                    <span className="text-secondary">Detecting...</span>
                  </div>
                  <div className="mt-3 text-xs text-technical">
                    Searching for NIP-07 compatible extensions
                  </div>
                </div>

                {/* Authentication Card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Authentication
                    </h3>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--text-tertiary)' }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--text-tertiary)' }}
                    />
                    <span className="text-secondary">Not connected</span>
                  </div>
                  <div className="mt-3 text-xs text-technical">
                    Public key: Not available
                  </div>
                </div>

                {/* Relay Status Card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Relay Status
                    </h3>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--error)' }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--error)' }}
                    />
                    <span className="text-secondary">Disconnected</span>
                  </div>
                  <div className="mt-3 text-xs text-technical">
                    Relays: 0/0 active
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Features Coming Soon
                </h2>
                <p className="text-secondary mb-8">
                  Building the future of decentralized social media
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Lightning Fast */}
                  <div className="card card-interactive">
                    <div className="text-center">
                      <div 
                        className="text-3xl mb-4"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        ⚡
                      </div>
                      <h3 className="font-semibold mb-2 text-emphasis">Lightning Fast</h3>
                      <p className="text-sm text-secondary mb-3">
                        Optimized for performance with real-time updates
                      </p>
                      <div className="text-xs text-technical">
                        Sub-100ms response times
                      </div>
                    </div>
                  </div>

                  {/* Secure & Private */}
                  <div className="card card-interactive">
                    <div className="text-center">
                      <div 
                        className="text-3xl mb-4"
                        style={{ color: 'var(--success)' }}
                      >
                        🔒
                      </div>
                      <h3 className="font-semibold mb-2 text-emphasis">Secure & Private</h3>
                      <p className="text-sm text-secondary mb-3">
                        End-to-end encryption with NIP-07 extensions
                      </p>
                      <div className="text-xs text-technical">
                        Zero private key exposure
                      </div>
                    </div>
                  </div>

                  {/* Decentralized */}
                  <div className="card card-interactive">
                    <div className="text-center">
                      <div 
                        className="text-3xl mb-4"
                        style={{ color: 'var(--info)' }}
                      >
                        🌐
                      </div>
                      <h3 className="font-semibold mb-2 text-emphasis">Decentralized</h3>
                      <p className="text-sm text-secondary mb-3">
                        Connect to multiple relays for true decentralization
                      </p>
                      <div className="text-xs text-technical">
                        Multi-relay redundancy
                      </div>
                    </div>
                  </div>

                  {/* Lightning Zaps */}
                  <div className="card card-interactive">
                    <div className="text-center">
                      <div 
                        className="text-3xl mb-4"
                        style={{ color: 'var(--bitcoin)' }}
                      >
                        💸
                      </div>
                      <h3 className="font-semibold mb-2 text-emphasis">Lightning Zaps</h3>
                      <p className="text-sm text-secondary mb-3">
                        Send and receive Bitcoin payments seamlessly
                      </p>
                      <div className="text-xs text-technical">
                        NIP-57 Lightning integration
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Status Footer */}
              <div className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="text-center">
                  <div className="text-technical mb-2">
                    Protocol Version: Nostr • Client Version: 0.1.0-alpha
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>
                    Built with React + TypeScript + Tailwind CSS
                  </div>
                </div>
              </div>
            </div>
          </PageLayout>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  )
}

export default App
