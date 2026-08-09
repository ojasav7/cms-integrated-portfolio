import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import appCss from '@/styles/app.css?url'

const THEME_SCRIPT = `try {
  var t = localStorage.getItem("theme-preference");
  var d = t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", d);
} catch(e) { document.documentElement.classList.add("dark"); }`

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap'

const INSTRUMENT_SERIF_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'Ojasav Studio — Digital Experiences',
      },
      {
        name: 'description',
        content:
          'A small creative studio crafting bold digital experiences — branding, film and web.',
      },
      { name: 'theme-color', content: '#141416' },
      { name: 'og:title', content: 'Ojasav Studio — Digital Experiences' },
      {
        name: 'og:description',
        content: 'Branding, film and web for ambitious teams.',
      },
      { name: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: FONT_HREF },
      { rel: 'stylesheet', href: INSTRUMENT_SERIF_HREF },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
        <Scripts />
      </body>
    </html>
  )
}
