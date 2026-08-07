import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { CollectionName } from '@/lib/cms/types'
import {
  deleteCollectionItem,
  getCollections,
  upsertCollectionItem,
} from '@/lib/admin/collections.functions'
import { useAdminStatus } from './route'
import { Badge, Banner, Card, PageHeader, Spinner } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

export const Route = createFileRoute('/admin/content')({
  component: ContentPage,
})

interface FieldConfig {
  key: string
  label: string
  textarea?: boolean
}

interface CollectionConfig {
  key: CollectionName
  label: string
  fields: FieldConfig[]
  summary: (item: Record<string, unknown>) => string
}

const COLLECTIONS: CollectionConfig[] = [
  {
    key: 'capabilities',
    label: 'Capabilities',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', textarea: true },
    ],
    summary: (i) => String(i.title ?? 'Untitled'),
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    fields: [
      { key: 'quote', label: 'Quote', textarea: true },
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
    ],
    summary: (i) => String(i.name ?? 'Anonymous'),
  },
  {
    key: 'caseStudies',
    label: 'Case studies',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description', textarea: true },
      { key: 'image', label: 'Image URL' },
      { key: 'url', label: 'Link URL' },
    ],
    summary: (i) => String(i.title ?? 'Untitled'),
  },
  {
    key: 'stats',
    label: 'Stats',
    fields: [
      { key: 'value', label: 'Value (e.g. 120+)' },
      { key: 'label', label: 'Label' },
    ],
    summary: (i) => `${String(i.value ?? '')} — ${String(i.label ?? '')}`,
  },
  {
    key: 'heroShowcase',
    label: 'Hero showcase',
    fields: [
      { key: 'image', label: 'Image URL' },
      { key: 'title', label: 'Title' },
      { key: 'caption', label: 'Caption' },
      { key: 'tag', label: 'Tag' },
    ],
    summary: (i) => String(i.title ?? 'Untitled'),
  },
]

function ContentPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Content"
        description="Collection items shown across the site — capabilities, testimonials, stats, case studies and hero slides."
      />
      <Tabs.Root defaultValue="capabilities">
        <Tabs.List className="mb-6 flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
          {COLLECTIONS.map((col) => (
            <Tabs.Trigger
              key={col.key}
              value={col.key}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors outline-none data-[state=active]:bg-ink data-[state=active]:text-background"
            >
              {col.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {COLLECTIONS.map((col) => (
          <Tabs.Content key={col.key} value={col.key}>
            <CollectionEditor collection={col} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  )
}

function CollectionEditor({ collection }: { collection: CollectionConfig }) {
  const { dbConfigured } = useAdminStatus()
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const cols = await getCollections()
    setItems(cols[collection.key] as unknown as Record<string, unknown>[])
  }

  useEffect(() => {
    setItems(null)
    setForm({})
    setEditingId(null)
    load()
  }, [collection.key])

  const reset = () => {
    setForm({})
    setEditingId(null)
  }

  const startEdit = (item: Record<string, unknown>) => {
    setEditingId(typeof item.id === 'string' ? item.id : null)
    const values: Record<string, string> = {}
    for (const field of collection.fields) {
      const v = item[field.key]
      values[field.key] = typeof v === 'string' ? v : ''
    }
    setForm(values)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const res = await upsertCollectionItem({
      data: {
        collection: collection.key,
        item: { ...form, id: editingId ?? undefined },
      },
    })
    setBusy(false)
    if (res.ok) {
      toast.success(editingId ? 'Item updated' : 'Item added')
      reset()
      load()
    } else {
      toast.error(res.error ?? 'Save failed')
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this item?')) return
    const res = await deleteCollectionItem({ data: { id } })
    if (res.ok) {
      toast.success('Item deleted')
      load()
    } else {
      toast.error(res.error ?? 'Delete failed')
    }
  }

  if (!items) return <Spinner label="Loading collection…" />

  return (
    <div className="grid gap-8">
      {!dbConfigured && (
        <Banner>
          Showing fallback content. Set <code>DATABASE_URL</code> to edit these
          collections.
        </Banner>
      )}

      <Card>
        <h2 className="mb-5 font-display text-lg font-medium">
          {editingId ? 'Edit item' : 'Add item'}
          {editingId && (
            <button
              onClick={reset}
              className="ml-3 text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Cancel
            </button>
          )}
        </h2>
        <form onSubmit={submit} className="grid gap-4">
          {collection.fields.map((field) => {
            const Field = field.textarea ? Textarea : Input
            return (
              <Field
                key={field.key}
                label={field.label}
                value={form[field.key] ?? ''}
                onChange={(
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >,
                ) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              />
            )
          })}
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
              {!editingId && <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Card>

      {items.length === 0 ? (
        <Card className="py-10 text-center text-sm text-muted-foreground">
          This collection is empty — add the first item above.
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item, i) => {
            const id = typeof item.id === 'string' ? item.id : null
            return (
              <div
                key={id ?? i}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <Badge tone="neutral">{String(i + 1).padStart(2, '0')}</Badge>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                  {collection.summary(item)}
                </p>
                <button
                  onClick={() => startEdit(item)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                  aria-label="Edit item"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {id && (
                  <button
                    onClick={() => remove(id)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-500"
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
