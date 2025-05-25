import { useState, useEffect } from 'react'

/**
 * Hook to detect if the page is at the top
 * @param threshold - The scroll threshold to consider as "top" (default: 10px)
 * @returns boolean indicating if the page is at the top
 */
export function useScrollTop(threshold: number = 10): boolean {
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsAtTop(scrollTop <= threshold)
    }

    // Set initial state
    handleScroll()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return isAtTop
}
