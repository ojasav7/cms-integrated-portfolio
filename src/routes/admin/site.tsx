import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Tabs from '@radix-ui/react-tabs'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { SiteConfig } from '@/lib/cms/types'
import { normalizeAsciiShowcase } from '@/lib/normalizers'
import { getSiteConfig, saveSiteConfig } from '@/lib/admin/site.functions'
import {
  ANIM_STYLES,
  BG_MODES,
  BLEND_MODES,
  BLUR_TYPES,
  CHAR_SETS,
  DEFAULT_ASCII_CONFIG,
  OVERLAY_BLENDS,
  RENDER_MODES,
  type AsciiArtConfig,
  type AsciiLightPoint,
  type AsciiTonePoint,
} from '@/components/ascii-art/config'
import { AsciiArt } from '@/components/ascii-art/ascii-art'
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
          {['hero', 'about', 'contact', 'footer', 'marquee', 'ascii'].map((tab) => (
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
        <Tabs.Content value="ascii">
          <AsciiForm site={site} onSave={save} />
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

/* ------------------------------------------------------------------ */
/* ASCII art showcase                                                  */
/* ------------------------------------------------------------------ */

function AsciiForm({
  site,
  onSave,
}: {
  site: SiteConfig
  onSave: (patch: Partial<SiteConfig>) => SaveResult
}) {
  // Deep-merge with defaults so older stored configs (missing toneCurve,
  // lights, pfx, …) never crash the editors.
  const [draft, setDraft] = useState(() => normalizeAsciiShowcase(site.asciiArt))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setDraft(normalizeAsciiShowcase(site.asciiArt))
  }, [site])

  const patch = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }))
  const patchConfig = (p: Partial<AsciiArtConfig>) =>
    setDraft((d) => ({ ...d, config: { ...d.config, ...p } }))
  const patchPfx = (key: string, p: Partial<{ enabled: boolean; intensity: number }>) =>
    setDraft((d) => ({
      ...d,
      config: {
        ...d.config,
        pfx: { ...d.config.pfx, [key]: { ...d.config.pfx[key], ...p } },
      },
    }))
  const resetConfig = () =>
    setDraft((d) => ({ ...d, config: DEFAULT_ASCII_CONFIG }))

  const submit = async () => {
    setBusy(true)
    const ok = await onSave({ asciiArt: draft })
    setBusy(false)
    if (ok) toast.success('ASCII art saved')
    else toast.error('Save failed')
  }

  return (
    <div className="grid gap-5">
      {/* Live preview — renders the current draft config, updates as you tweak. */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Live preview
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Renders your unsaved draft — every control below applies instantly.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={resetConfig}>
            Reset to defaults
          </Button>
        </div>
        <div className="p-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-black/80">
            {draft.image ? (
              <AsciiArt
                src={draft.image}
                config={draft.config}
                className="h-full w-full"
                alt="ASCII art preview"
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
                Paste an image URL above to preview the effect.
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="grid gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Section
          </h3>
          <ToggleInput
            label="Enabled"
            checked={draft.enabled}
            onChange={(v) => patch({ enabled: v })}
          />
        </div>
        <TextInput label="Eyebrow" value={draft.eyebrow} onChange={(v) => patch({ eyebrow: v })} />
        <TextInput label="Title" value={draft.title} onChange={(v) => patch({ title: v })} />
        <Textarea
          label="Description"
          rows={3}
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
        <TextInput label="Image URL" value={draft.image} onChange={(v) => patch({ image: v })} />
      </Card>

      <Card className="grid gap-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Render
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectInput
            label="Render mode"
            value={draft.config.renderMode}
            options={RENDER_MODES.map((m) => ({ value: m, label: m }))}
            onChange={(v) => patchConfig({ renderMode: v })}
          />
          <SelectInput
            label="Background"
            value={draft.config.bgMode}
            options={BG_MODES.map((m) => ({ value: m.value, label: m.label }))}
            onChange={(v) => patchConfig({ bgMode: v })}
          />
          <SelectInput
            label="Char set"
            value={draft.config.charSet}
            options={CHAR_SETS.map((c) => ({ value: c.value, label: c.label }))}
            onChange={(v) => patchConfig({ charSet: v })}
          />
          <SelectInput
            label="Blend mode"
            value={draft.config.styleBlend}
            options={BLEND_MODES.map((m) => ({ value: m, label: m }))}
            onChange={(v) => patchConfig({ styleBlend: v })}
          />
        </div>
        {draft.config.charSet === 'custom' && (
          <TextInput
            label="Custom characters (dark → light)"
            value={draft.config.customChars}
            onChange={(v) => patchConfig({ customChars: v })}
          />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberInput label="Cell size (px)" value={draft.config.cellSize} min={3} max={60} onChange={(v) => patchConfig({ cellSize: v })} />
          <RangeInput label="Coverage" value={draft.config.coverage} onChange={(v) => patchConfig({ coverage: v })} />
          <RangeInput label="Density" value={draft.config.density} onChange={(v) => patchConfig({ density: v })} />
          <RangeInput label="Edge emphasis" value={draft.config.edgeEmphasis} onChange={(v) => patchConfig({ edgeEmphasis: v })} />
          <RangeInput label="Background blur" value={draft.config.bgBlur} onChange={(v) => patchConfig({ bgBlur: v })} />
          <RangeInput label="Background opacity" value={draft.config.bgOpacity} onChange={(v) => patchConfig({ bgOpacity: v })} />
        </div>
        <ToggleInput label="Invert" checked={draft.config.invert} onChange={(v) => patchConfig({ invert: v })} />
      </Card>

      <Card className="grid gap-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Color
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <RangeInput label="Brightness" value={draft.config.brightness} min={-100} max={100} onChange={(v) => patchConfig({ brightness: v })} />
          <RangeInput label="Contrast" value={draft.config.contrast} min={0} max={200} onChange={(v) => patchConfig({ contrast: v })} />
          <RangeInput label="Saturation" value={draft.config.saturation} min={0} max={200} onChange={(v) => patchConfig({ saturation: v })} />
          <RangeInput label="Grayscale" value={draft.config.grayscale} onChange={(v) => patchConfig({ grayscale: v })} />
          <ColorInput label="Tint" value={draft.config.tint} onChange={(v) => patchConfig({ tint: v })} />
          <RangeInput label="Tint opacity" value={draft.config.tintOpacity} onChange={(v) => patchConfig({ tintOpacity: v })} />
          <SelectInput
            label="Tint blend"
            value={draft.config.overlayBlend}
            options={OVERLAY_BLENDS.map((m) => ({ value: m, label: m }))}
            onChange={(v) => patchConfig({ overlayBlend: v })}
          />
        </div>
        <div className="border-t border-border pt-4">
          <ToneCurveEditor
            points={draft.config.toneCurve}
            onChange={(points) => patchConfig({ toneCurve: points })}
          />
        </div>
      </Card>

      <Card className="grid gap-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Blur
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectInput
            label="Blur type"
            value={draft.config.blurType}
            options={BLUR_TYPES.map((b) => ({ value: b.value, label: b.label }))}
            onChange={(v) => patchConfig({ blurType: v })}
          />
          <RangeInput label="Blur amount" value={draft.config.blurAmount} onChange={(v) => patchConfig({ blurAmount: v })} />
          {draft.config.blurType === 'motion' && (
            <>
              <RangeInput label="Blur angle" value={draft.config.blurAngle} min={0} max={360} onChange={(v) => patchConfig({ blurAngle: v })} />
              <ToggleInput
                label="Both sides"
                checked={draft.config.directionalBothSides}
                onChange={(v) => patchConfig({ directionalBothSides: v })}
              />
            </>
          )}
          {draft.config.blurType === 'tilt' && (
            <>
              <RangeInput label="Focus size" value={draft.config.tiltFocus} onChange={(v) => patchConfig({ tiltFocus: v })} />
              <RangeInput label="Focus position" value={draft.config.tiltPosition} onChange={(v) => patchConfig({ tiltPosition: v })} />
              <RangeInput label="Feather" value={draft.config.tiltFeather} onChange={(v) => patchConfig({ tiltFeather: v })} />
            </>
          )}
          {draft.config.blurType === 'lens' && (
            <>
              <RangeInput label="Focus radius" value={draft.config.lensFocus} onChange={(v) => patchConfig({ lensFocus: v })} />
              <RangeInput label="Center X" value={draft.config.blurCenterX} onChange={(v) => patchConfig({ blurCenterX: v })} />
              <RangeInput label="Center Y" value={draft.config.blurCenterY} onChange={(v) => patchConfig({ blurCenterY: v })} />
            </>
          )}
          {draft.config.blurType === 'progressive' && (
            <>
              <RangeInput label="Position" value={draft.config.progressivePosition} onChange={(v) => patchConfig({ progressivePosition: v })} />
              <ToggleInput label="Reverse" checked={draft.config.progressiveReverse} onChange={(v) => patchConfig({ progressiveReverse: v })} />
            </>
          )}
        </div>
      </Card>

      <Card className="grid gap-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Post effects
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(draft.config.pfx).map(([key, setting]) => (
            <div key={key} className="grid gap-2 rounded-xl border border-border p-4">
              <ToggleInput
                label={key}
                checked={setting.enabled}
                onChange={(v) => patchPfx(key, { enabled: v })}
              />
              <RangeInput
                label="Intensity"
                value={setting.intensity}
                disabled={!setting.enabled}
                onChange={(v) => patchPfx(key, { intensity: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="grid gap-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Lights
        </h3>
        <ToggleInput
          label="Enabled"
          checked={draft.config.lights.enabled}
          onChange={(v) => patchConfig({ lights: { ...draft.config.lights, enabled: v } })}
        />
        {draft.config.lights.enabled && (
          <LightsEditor
            points={draft.config.lights.points}
            onChange={(points) =>
              patchConfig({ lights: { ...draft.config.lights, points } })
            }
          />
        )}
      </Card>

      <Card className="grid gap-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Animation
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <ToggleInput label="Animated" checked={draft.config.animated} onChange={(v) => patchConfig({ animated: v })} />
          <SelectInput
            label="Style"
            value={draft.config.animStyle}
            options={ANIM_STYLES.map((s) => ({ value: s, label: s }))}
            onChange={(v) => patchConfig({ animStyle: v })}
          />
          <ToggleInput
            label="Speed enabled"
            checked={draft.config.animSpeed.enabled}
            onChange={(v) => patchConfig({ animSpeed: { ...draft.config.animSpeed, enabled: v } })}
          />
          <RangeInput
            label="Speed"
            value={draft.config.animSpeed.intensity}
            disabled={!draft.config.animSpeed.enabled}
            onChange={(v) => patchConfig({ animSpeed: { ...draft.config.animSpeed, intensity: v } })}
          />
          <ToggleInput
            label="Intensity enabled"
            checked={draft.config.animIntensity.enabled}
            onChange={(v) => patchConfig({ animIntensity: { ...draft.config.animIntensity, enabled: v } })}
          />
          <RangeInput
            label="Intensity"
            value={draft.config.animIntensity.intensity}
            disabled={!draft.config.animIntensity.enabled}
            onChange={(v) => patchConfig({ animIntensity: { ...draft.config.animIntensity, intensity: v } })}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Save ASCII art'}
        </Button>
      </div>
    </div>
  )
}

/* Tone-curve + lights editors --------------------------------------- */

function ToneCurveEditor({
  points,
  onChange,
}: {
  points: AsciiTonePoint[]
  onChange: (points: AsciiTonePoint[]) => void
}) {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  const update = (i: number, patch: Partial<AsciiTonePoint>) =>
    onChange(sorted.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const add = () =>
    onChange([...sorted, { x: 0.5, y: 0.5 }].sort((a, b) => a.x - b.x))
  const remove = (i: number) => {
    if (sorted.length <= 2) return
    onChange(sorted.filter((_, j) => j !== i))
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Tone curve (luminance → glyph weight)
        </span>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add point
        </Button>
      </div>
      {sorted.map((p, i) => (
        <div key={i} className="grid gap-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Point {i + 1} of {sorted.length}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={sorted.length <= 2}
              className="text-muted-foreground transition-colors hover:text-red-500 disabled:opacity-30"
              aria-label="Remove point"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <RangeInput
              label="Input (x)"
              value={Math.round(p.x * 100)}
              onChange={(v) => update(i, { x: v / 100 })}
            />
            <RangeInput
              label="Output (y)"
              value={Math.round(p.y * 100)}
              onChange={(v) => update(i, { y: v / 100 })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function LightsEditor({
  points,
  onChange,
}: {
  points: AsciiLightPoint[]
  onChange: (points: AsciiLightPoint[]) => void
}) {
  const update = (i: number, patch: Partial<AsciiLightPoint>) =>
    onChange(points.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const add = () =>
    onChange([
      ...points,
      { x: 0.5, y: 0.5, radius: 0.15, intensity: 60 },
    ])
  const remove = (i: number) =>
    onChange(points.filter((_, j) => j !== i))

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Glow points
        </span>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add light
        </Button>
      </div>
      {points.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No glow points yet — add one to light up the art.
        </p>
      )}
      {points.map((p, i) => (
        <div key={i} className="grid gap-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Light {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground transition-colors hover:text-red-500"
              aria-label="Remove light"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <RangeInput
              label="X"
              value={Math.round(p.x * 100)}
              onChange={(v) => update(i, { x: v / 100 })}
            />
            <RangeInput
              label="Y"
              value={Math.round(p.y * 100)}
              onChange={(v) => update(i, { y: v / 100 })}
            />
            <RangeInput
              label="Radius"
              value={Math.round(p.radius * 100)}
              onChange={(v) => update(i, { radius: v / 100 })}
            />
            <RangeInput
              label="Intensity"
              value={p.intensity}
              onChange={(v) => update(i, { intensity: v })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* Small controlled field helpers ------------------------------------ */

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Input
      label={label}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <Input
      label={label}
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

function RangeInput({
  label,
  value,
  min = 0,
  max = 100,
  disabled,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  disabled?: boolean
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
        <span className="tabular-nums">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent disabled:opacity-40"
      />
    </label>
  )
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-border bg-transparent px-4 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-card text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-border px-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
        />
        <span className="font-mono text-sm text-muted-foreground">{value}</span>
      </div>
    </label>
  )
}

function ToggleInput({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40',
          checked ? 'bg-accent' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  )
}

