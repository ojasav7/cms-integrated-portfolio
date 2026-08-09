import { createFileRoute } from '@tanstack/react-router'
import { MeasuredProject } from '@/components/measured/MeasuredProject'

export const Route = createFileRoute('/projects/measured')({
  head: () => ({
    meta: [
      { title: 'Measured — Portfolio Project' },
      {
        name: 'description',
        content: 'Measured — a premium health/wellness wearable concept. Interactive project experience.',
      },
    ],
  }),
  component: MeasuredProjectRoute,
})

function MeasuredProjectRoute() {
  return (
    <main className="min-h-screen bg-white">
      <MeasuredProject />
    </main>
  )
}
