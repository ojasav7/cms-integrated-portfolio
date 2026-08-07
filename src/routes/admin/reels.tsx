import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Clapperboard, Pencil, Plus, Trash2 } from 'lucide-react'
import type { ReelItem } from '@/lib/cms/types'
import {
  deleteReel,
  getReels,
  reorderReel,
  upsertReel,
} from '@/lib/admin/reels.functions'
import { useAdminStatus } from './route'
import { Badge, Banner, Card, PageHeader, Spinner } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

export const Route = createFileRoute('/admin/reels')({
  component: ReelsPage,
})

const EMPTY_FORM = {
  id: '',
  tag: '',
  title: '',
  url: '',
  description: '',
  poster: '',
}

type ReelForm = typeof EMPTY_FORM

function ReelsPage() {
  const { dbConfigured } = useAdminStatus()
  const [reels, setReels] = useState<ReelItem[] | null>(null)
  const [form, setForm] = useState<ReelForm>(EMPTY_FORM)
  const [busy, setBusy] = useState(false)

  const load = async () => setReels(await getReels())

  useEffect(() => {
    load()
  }, [])

  const set = (key: keyof ReelForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const res = await upsertReel({
      data: { reel: { id: form.id || undefined, tag: form.tag, title: form.title, url: form.url, description: form.description, poster: form.poster } },
    })
    setBusy(false)
    if (res.ok) {
      toast.success(form.id ? 'Reel updated' : 'Reel added')
      setForm(EMPTY_FORM)
      load()
    } else {
      toast.error(res.error ?? 'Save failed')
    }
  }

  const startEdit = (reel: ReelItem) => {
    setForm({
      id: reel.id ?? '',
      tag: reel.tag,
      title: reel.title,
      url: reel.url ?? '',
      description: reel.description,
      poster: reel.poster,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this reel?')) return
    const res = await deleteReel({ data: { id } })
    if (res.ok) {
      toast.success('Reel deleted')
      load()
    } else {
      toast.error(res.error ?? 'Delete failed')
    }
  }

  const move = async (id: string, direction: 'up' | 'down') => {
    const res = await reorderReel({ data: { id, direction } })
    if (res.ok) load()
    else toast.error(res.error ?? 'Reorder failed')
  }

  if (!reels) return <Spinner label="Loading reels…" />

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Reels"
        description="Videos shown in the reels section. YouTube and Vimeo links are converted to embeds automatically."
      />
      {!dbConfigured && (
        <Banner>
          Running on sample reels. Set <code>DATABASE_URL</code> to add, edit and reorder.
        </Banner>
      )}

      <Card className="mb-8">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-medium">
          {form.id ? 'Edit reel' : 'Add a reel'}
          {form.id && (
            <button
              onClick={() => setForm(EMPTY_FORM)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Cancel edit
            </button>
          )}
        </h2>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Title" value={form.title} onChange={set('title')} placeholder="Brand film — Meridian" required />
            <Input label="Tag" value={form.tag} onChange={set('tag')} placeholder="Film, Motion, Web…" />
          </div>
          <Input
            label="Video URL"
            value={form.url}
            onChange={set('url')}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <Textarea label="Description" rows={2} value={form.description} onChange={set('description')} />
          <Input label="Poster image URL" value={form.poster} onChange={set('poster')} placeholder="https://…" />
          <div className="flex justify-end">
            <Button type="submit" disabled={busy || !form.title}>
              {busy ? 'Saving…' : form.id ? 'Update reel' : 'Add reel'}
              {!form.id && <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Card>

      {reels.length === 0 ? (
        <Card className="grid place-items-center gap-2 py-14 text-muted-foreground">
          <Clapperboard className="h-8 w-8" />
          <p className="text-sm">No reels yet — add your first one above.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reels.map((reel) => (
            <Card key={reel.id ?? reel.title} className="flex items-center gap-5">
              <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
                {reel.poster ? (
                  <img src={reel.poster} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <Clapperboard className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-base font-medium">{reel.title}</h3>
                  {reel.tag && <Badge tone="accent">{reel.tag}</Badge>}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {reel.url || reel.embedUrl || 'No video URL'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {reel.id && (
                  <>
                    <IconBtn label="Move up" onClick={() => move(reel.id!, 'up')}>
                      <ArrowUp className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Move down" onClick={() => move(reel.id!, 'down')}>
                      <ArrowDown className="h-4 w-4" />
                    </IconBtn>
                  </>
                )}
                <IconBtn label="Edit" onClick={() => startEdit(reel)}>
                  <Pencil className="h-4 w-4" />
                </IconBtn>
                {reel.id && (
                  <IconBtn label="Delete" danger onClick={() => remove(reel.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground ${
        danger ? 'hover:border-red-500/40 hover:text-red-500' : 'hover:border-accent'
      }`}
    >
      {children}
    </button>
  )
}
