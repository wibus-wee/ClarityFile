## 目前的 CSS

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

## 可用 theme props

```ts
export const themeStylePropsSchema = z.object({
  background: z.string().describe('The default background color, paired with `foreground`.'),
  foreground: z.string().describe('Paired with `background`.'),
  card: z.string().describe('The background color for cards, paired with `card-foreground`.'),
  'card-foreground': z.string().describe('Paired with `card`.'),
  popover: z
    .string()
    .describe('The background color for popovers, paired with `popover-foreground`.'),
  'popover-foreground': z.string().describe('Paired with `popover`.'),
  primary: z.string().describe('The main color, paired with `primary-foreground`.'),
  'primary-foreground': z.string().describe('Paired with `primary`.'),
  secondary: z.string().describe('A secondary color, paired with `secondary-foreground`.'),
  'secondary-foreground': z.string().describe('Paired with `secondary`.'),
  muted: z.string().describe('A muted background color, paired with `muted-foreground`.'),
  'muted-foreground': z.string().describe('Paired with `muted`.'),
  accent: z
    .string()
    .describe('Subtle color for hover or highlight, paired with `accent-foreground`.'),
  'accent-foreground': z.string().describe('Paired with `accent`.'),
  destructive: z
    .string()
    .describe('Color for destructive actions, paired with `destructive-foreground`.'),
  'destructive-foreground': z.string().describe('Paired with `destructive`.'),
  border: z.string().describe('The color for borders.'),
  input: z.string().describe('The background color for input fields.'),
  ring: z.string().describe('The color for focus rings.'),
  'chart-1': z.string(),
  'chart-2': z.string(),
  'chart-3': z.string(),
  'chart-4': z.string(),
  'chart-5': z.string(),
  sidebar: z
    .string()
    .describe('The background color for the sidebar, paired with `sidebar-foreground`.'),
  'sidebar-foreground': z.string().describe('Paired with `sidebar`.'),
  'sidebar-primary': z
    .string()
    .describe('The primary color for sidebar elements, paired with `sidebar-primary-foreground`.'),
  'sidebar-primary-foreground': z.string().describe('Paired with `sidebar-primary`.'),
  'sidebar-accent': z
    .string()
    .describe('An accent color for the sidebar, paired with `sidebar-accent-foreground`.'),
  'sidebar-accent-foreground': z.string().describe('Paired with `sidebar-accent`.'),
  'sidebar-border': z.string().describe('The color for borders within the sidebar.'),
  'sidebar-ring': z.string().describe('The color for focus rings within the sidebar.'),
  'font-sans': z.string().describe('The preferred sans-serif font family.'),
  'font-serif': z.string().describe('The preferred serif font family.'),
  'font-mono': z.string().describe('The preferred monospace font family.'),
  radius: z
    .string()
    .describe('The global border-radius for components. Use 0rem for sharp corners.'),
  'shadow-color': z.string(),
  'shadow-opacity': z.string(),
  'shadow-blur': z.string(),
  'shadow-spread': z.string(),
  'shadow-offset-x': z.string(),
  'shadow-offset-y': z.string(),
  'letter-spacing': z.string().describe('The global letter spacing for text.'),
  spacing: z.string()
})

export const themeStylesSchema = z.object({
  light: themeStylePropsSchema,
  dark: themeStylePropsSchema
})
```

## 要求主题风格

我需要一个可爱的，很二次元的，浪漫的，花花的一个主题

## 输出要求

输出为 CSS

• 请根据要求主题风格自行设定，使用 oklch
• 不要输出多余内容，只输出 CSS 代码块。
