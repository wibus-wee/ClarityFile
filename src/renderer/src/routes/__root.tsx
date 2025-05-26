import { HeroUIProvider } from '@heroui/react'
import { ClarityLayout } from '@renderer/components/layouts/ClarityLayout'
import { DataProvider } from '@renderer/providers/data-provider'
import { SWRProvider } from '@renderer/providers/swr-provider'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { DefaultNotFound } from '@renderer/components/not-found'

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <HeroUIProvider>
          <SWRProvider>
            <DataProvider>
              <ClarityLayout>
                <Outlet />
              </ClarityLayout>
            </DataProvider>
          </SWRProvider>
        </HeroUIProvider>
      </ThemeProvider>
      <Toaster richColors position="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
  notFoundComponent: DefaultNotFound
})
