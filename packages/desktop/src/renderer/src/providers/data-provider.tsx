import { PropsWithChildren, useEffect } from 'react'
import { useAppStore } from '@renderer/stores/app'

export function DataProvider({ children }: PropsWithChildren) {
  const setUser = useAppStore((state) => state.setUser)

  useEffect(() => {
    setUser({
      name: 'Bingsong Wu',
      email: 'i@wibus.ren',
      avatar: 'https://github.com/wibus-wee.png',
      role: 'founder'
    })
  }, [setUser])

  return <>{children}</>
}
