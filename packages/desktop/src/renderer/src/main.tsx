import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { DefaultErrorComponent } from './components/error-boundary'

// Initialize i18n
import { useI18nStore } from './i18n/store'

import { scan } from 'react-scan'
scan({
  enabled: import.meta.env.DEV
})

// Initialize i18n before rendering the app
// We can get the initial language from localStorage or use a default
const initialLanguage = (localStorage.getItem('i18nextLng') as any) || 'zh-CN'
useI18nStore.getState().actions.initialize(initialLanguage)

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
