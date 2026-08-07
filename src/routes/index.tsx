import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <p className="font-display text-2xl">Ojasav Studio — scaffold booting…</p>
    </main>
  )
}
