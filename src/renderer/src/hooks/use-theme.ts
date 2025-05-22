import { useTheme as useNextTheme } from 'next-themes'

export type Theme = 'dark' | 'light' | 'system'

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()

  // 获取实际应用的主题
  const currentTheme = theme === 'system' ? systemTheme : theme

  // 切换主题
  const toggleTheme = () => {
    if (currentTheme === 'dark') {
      changeTheme('light')
    } else {
      changeTheme('dark')
    }
  }

  // 设置指定主题
  const changeTheme = (theme: Theme) => {
    setTheme(theme)
    // invoke("toggle_window_theme", { theme })
  }

  return {
    theme: theme as Theme, // 当前设置的主题
    currentTheme: currentTheme as Exclude<Theme, 'system'>, // 实际应用的主题
    setTheme: changeTheme, // 设置主题
    toggleTheme, // 切换主题
    systemTheme: systemTheme as Exclude<Theme, 'system'> // 系统主题
  }
}
