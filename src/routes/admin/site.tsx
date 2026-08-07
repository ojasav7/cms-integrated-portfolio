import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Tabs from '@radix-ui/react-tabs'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SiteConfig } from '@/lib/cms/types'
import { getSiteConfig, saveSiteConfig } from '@/lib/admin/site.functions'
import { useAdminStatus } from './route'
import { Banner, Card, PageHeader, Spinner } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

export const Route = createFileRoute('/admin/site')({
  component: SitePage,
})

const heroSchema = z.object({
  eyebrow: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  headline: z.string().min(1, 'Required'),
  subheadline: z.string(),
})

const tileSchema = z.object({
  title: z.string().min(1, 'Required'),
  body: z.string(),
})

const aboutSchema = z.object({
  eyebrow: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  body: z.string(),
  tiles: z.array(tileSchema).min(1, 'Add at least one tile'),
})

const contactSchema = z.object({
  eyebrow: z.string().min(1, 'Required'),
  headline: z.string().min(1, 'Required'),
  blurb: z.string(),
  email: z.string().min(1, 'Required').email('Invalid email'),
  location: z.string(),
})

const socialSchema = z.object({
  label: z.string().min(1, 'Required'),
  url: z.string().min(1, 'Required'),
})

const footerSchema = z.object({
  copyright: z.string().min(1, 'Required'),
  socials: z.array(socialSchema),
})

type SaveResult = Promise<boolean>

function SitePage() {
  const { dbConfigured } = useAdminStatus()
  const [site, setSite] = useState<SiteConfig | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSiteConfig()
      .then(setSite)
      .catch(() => setError('Failed to load site config'))
  }, [])

  const save = async (patch: Partial<SiteConfig>): SaveResult => {
    if (!site) return false
    const next = { ...site, ...patch }
    const res = await saveSiteConfig({ data: next })
    if (res.ok) {
      setSite(next)
      return true
    }
    return false
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!site) return <Spinner label="Loading site config…" />

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Site"
        description="Edit the text that powers the public page. Changes are saved per section."
      />
      {!dbConfigured && (
        <Banner>
          Running on fallback content. Set <code>DATABASE_URL</code> and run{' '}
          <code>bun run db:push</code> to persist edits.
        </Banner>
      )}
      <Tabs.Root defaultValue="hero">
        <Tabs.List className="mb-6 flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
          {['hero', 'about', 'contact', 'footer', 'marquee'].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="rounded-full px-4 py-2 text-sm capitalize text-muted-foreground transition-colors outline-none data-[state=active]:bg-ink data-[state=active]:text-background"
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="hero">
          <HeroForm site={site} onSave={save} />
        </Tabs.Content>
        <Tabs.Content value="about">
          <AboutForm site={site} onSave={save} />
        </Tabs.Content>
        <Tabs.Content value="contact">
          <ContactForm site={site} onSave={save} />
        </Tabs.Content>
        <Tabs.Content value="footer">
          <FooterForm site={site} onSave={save} />
        </Tabs.Content>
        <Tabs.Content value="marquee">
          <MarqueeForm site={site} onSave={save} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

function SaveBar({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <div className="mt-6 flex justify-end">
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : label}
      </Button>
    </div>
  )
}

function HeroForm({
  site,
  onSave,
}: {
  site: SiteConfig
  onSave: (patch: Partial<SiteConfig>) => SaveResult
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof heroSchema>>({
    resolver: zodResolver(heroSchema),
    defaultValues: site.hero,
  })

  const submit = handleSubmit(async (values) => {
    if (await onSave({ hero: values })) toast.success('Hero saved')
    else toast.error('Save failed')
  })

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Card className="grid gap-5">
        <Input label="Eyebrow" placeholder="Independent studio" error={errors.eyebrow?.message} {...register('eyebrow')} />
        <Input label="Name" placeholder="Ojasav Thakur" error={errors.name?.message} {...register('name')} />
        <Textarea
          label="Headline"
          rows={2}
          placeholder="We craft bold digital experiences"
          error={errors.headline?.message}
          {...register('headline')}
        />
        <Textarea
          label="Subheadline"
          rows={3}
          placeholder="One supporting sentence…"
          error={errors.subheadline?.message}
          {...register('subheadline')}
        />
      </Card>
      <SaveBar submitting={isSubmitting} label="Save hero" />
    </form>
  )
}

function AboutForm({
  site,
  onSave,
}: {
  site: SiteConfig
  onSave: (patch: Partial<SiteConfig>) => SaveResult
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof aboutSchema>>({
    resolver: zodResolver(aboutSchema),
    defaultValues: site.about,
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tiles',
  })

  const submit = handleSubmit(async (values) => {
    if (await onSave({ about: values })) toast.success('About saved')
    else toast.error('Save failed')
  })

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Card className="grid gap-5">
        <Input label="Eyebrow" error={errors.eyebrow?.message} {...register('eyebrow')} />
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Body" rows={5} error={errors.body?.message} {...register('body')} />
      </Card>

      <Card className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline tiles
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ title: '', body: '' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add tile
          </Button>
        </div>
        {errors.tiles?.message && (
          <p className="text-xs text-red-500">{errors.tiles.message}</p>
        )}
        {fields.map((field, i) => (
          <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Tile {i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground transition-colors hover:text-red-500"
                aria-label="Remove tile"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Input placeholder="Title" error={errors.tiles?.[i]?.title?.message} {...register(`tiles.${i}.title`)} />
            <Textarea placeholder="Body" rows={2} {...register(`tiles.${i}.body`)} />
          </div>
        ))}
      </Card>
      <SaveBar submitting={isSubmitting} label="Save about" />
    </form>
  )
}

function ContactForm({
  site,
  onSave,
}: {
  site: SiteConfig
  onSave: (patch: Partial<SiteConfig>) => SaveResult
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: site.contact,
  })

  const submit = handleSubmit(async (values) => {
    if (await onSave({ contact: values })) toast.success('Contact saved')
    else toast.error('Save failed')
  })

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Card className="grid gap-5">
        <Input label="Eyebrow" error={errors.eyebrow?.message} {...register('eyebrow')} />
        <Textarea label="Headline" rows={2} error={errors.headline?.message} {...register('headline')} />
        <Textarea label="Blurb" rows={3} error={errors.blurb?.message} {...register('blurb')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Location" error={errors.location?.message} {...register('location')} />
      </Card>
      <SaveBar submitting={isSubmitting} label="Save contact" />
    </form>
  )
}

function FooterForm({
  site,
  onSave,
}: {
  site: SiteConfig
  onSave: (patch: Partial<SiteConfig>) => SaveResult
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof footerSchema>>({
    resolver: zodResolver(footerSchema),
    defaultValues: site.footer,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'socials' })

  const submit = handleSubmit(async (values) => {
    if (await onSave({ footer: values })) toast.success('Footer saved')
    else toast.error('Save failed')
  })

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Card className="grid gap-4">
        <Input label="Copyright" error={errors.copyright?.message} {...register('copyright')} />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Social links
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ label: '', url: '' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add link
          </Button>
        </div>
        {fields.map((field, i) => (
          <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1.4fr_auto]">
            <Input placeholder="Label" error={errors.socials?.[i]?.label?.message} {...register(`socials.${i}.label`)} />
            <Input placeholder="https://…" error={errors.socials?.[i]?.url?.message} {...register(`socials.${i}.url`)} />
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-12 w-12 place-items-center self-end rounded-xl border border-border text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-500"
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </Card>
      <SaveBar submitting={isSubmitting} label="Save footer" />
    </form>
  )
}

function MarqueeForm({
  site,
  onSave,
}: {
  site: SiteConfig
  onSave: (patch: Partial<SiteConfig>) => SaveResult
}) {
  const [top, setTop] = useState(site.marquee.top.join('\n'))
  const [bottom, setBottom] = useState(site.marquee.bottom.join('\n'))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setTop(site.marquee.top.join('\n'))
    setBottom(site.marquee.bottom.join('\n'))
  }, [site])

  const toWords = (value: string) =>
    value
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean)

  const submit = async () => {
    setBusy(true)
    const ok = await onSave({
      marquee: { top: toWords(top), bottom: toWords(bottom) },
    })
    setBusy(false)
    if (ok) toast.success('Marquee saved')
    else toast.error('Save failed')
  }

  return (
    <Card className="grid gap-5">
      <p className="text-xs leading-relaxed text-muted-foreground">
        One word per line. Words scroll in an infinite strip on the page.
      </p>
      <Textarea label="Top strip" rows={4} value={top} onChange={(e) => setTop(e.target.value)} />
      <Textarea label="Bottom strip" rows={4} value={bottom} onChange={(e) => setBottom(e.target.value)} />
      <div className="mt-2 flex justify-end">
        <Button onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Save marquee'}
        </Button>
      </div>
    </Card>
  )
}

