/**
 * Main App component
 * Sets up the application shell with Redux store, error boundary, and basic layout
 * Implements the cypherpunk dark theme system with proper visual hierarchy
 */

import { Provider } from 'react-redux'
import { store } from '@/store'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary, PageLayout, Header } from '@/components'
import AppRoutes from '@/routes'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <PageLayout header={<Header />} maxWidth="full">
            <AppRoutes />
          </PageLayout>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  )
}

export default App
