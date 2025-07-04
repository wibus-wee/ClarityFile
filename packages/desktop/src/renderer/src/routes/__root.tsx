import { HeroUIProvider } from '@heroui/react'
import { ClarityLayout } from '@renderer/components/layouts/ClarityLayout'
import { DataProvider } from '@renderer/providers/data-provider'
import { SWRProvider } from '@renderer/providers/swr-provider'
import { CustomThemeProvider } from '@renderer/providers/custom-theme-provider'
import { createRootRoute, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'
import { DefaultNotFound } from '@renderer/components/not-found'
import { CommandBox, CommandBoxProvider } from '@renderer/components/command-box'

export const Route = createRootRoute({
  component: () => (
    <>
      <CustomThemeProvider>
        <HeroUIProvider>
          <SWRProvider>
            <DataProvider>
              <CommandBoxProvider>
                <ClarityLayout>
                  <Outlet />
                </ClarityLayout>
                <CommandBox />
              </CommandBoxProvider>
            </DataProvider>
          </SWRProvider>
        </HeroUIProvider>
      </CustomThemeProvider>
      <Toaster richColors />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  ),
  notFoundComponent: DefaultNotFound
})
