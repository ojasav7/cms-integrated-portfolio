import { useState, type FormEvent } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { login } from '@/lib/admin/auth.functions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/admin/login')({
  component: LoginPage,
})

function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const router = useRouter()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await login({ data: { password } })
    setBusy(false)
    if (res.ok) {
      await router.invalidate()
      navigate({ to: '/admin' })
    } else {
      setError(res.error ?? 'Login failed')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink text-background">
            <ShieldCheck className="h-6 w-6 text-accent" />
          </span>
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Studio Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage content for Ojasav Studio.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
        >
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            required
          />
          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || !password} size="lg">
            {busy ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          The password comes from the <code className="text-accent">ADMIN_PASSWORD</code>{' '}
          environment variable.
        </p>
      </div>
    </div>
  )
}
