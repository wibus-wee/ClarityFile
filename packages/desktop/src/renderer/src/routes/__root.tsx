import { HeroUIProvider } from '@heroui/react'
import { ClarityLayout } from '@renderer/components/layouts/ClarityLayout'
import { DataProvider } from '@renderer/providers/data-provider'
import { SWRProvider } from '@renderer/providers/swr-provider'
import { CustomThemeProvider } from '@renderer/providers/custom-theme-provider'
import { CommandPaletteProvider } from '@renderer/components/command-palette'
import { ShortcutProvider } from '@renderer/components/shortcuts'
import { createRootRoute, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'
import { DefaultNotFound } from '@renderer/components/not-found'

export const Route = createRootRoute({
  component: () => (
    <>
      <CustomThemeProvider>
        <HeroUIProvider>
          <SWRProvider>
            <DataProvider>
              <ShortcutProvider scope="global">
                <CommandPaletteProvider>
                  <ClarityLayout>
                    <Outlet />
                  </ClarityLayout>
                </CommandPaletteProvider>
              </ShortcutProvider>
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
