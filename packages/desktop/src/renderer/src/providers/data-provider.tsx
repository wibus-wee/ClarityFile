import { PropsWithChildren, useEffect } from 'react'
import { useAppStore } from '@renderer/stores/app'

export function DataProvider({ children }: PropsWithChildren) {
  const initializeUser = useAppStore((state) => state.initializeUser)

  useEffect(() => {
    initializeUser()
  }, [initializeUser])

  return <>{children}</>
}
