import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { DefaultErrorComponent } from './components/error-boundary'

import { scan } from 'react-scan'
scan({
  enabled: import.meta.env.DEV
})

const hashHistory = createHashHistory()

// Create a new router instance
const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultErrorComponent: DefaultErrorComponent
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
