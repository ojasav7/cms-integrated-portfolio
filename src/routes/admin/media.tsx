import { useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Check, Copy, ImagePlus, UploadCloud } from 'lucide-react'
import { uploadMedia } from '@/lib/admin/media.functions'
import { useAdminStatus } from './route'
import { Banner, Card, PageHeader } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin/media')({
  component: MediaPage,
})

interface UploadResult {
  url: string
  publicId: string
}

function MediaPage() {
  const { cloudinaryConfigured } = useAdminStatus()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [copied, setCopied] = useState(false)

  const onFile = (file: File | null) => {
    setResult(null)
    setCopied(false)
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const upload = async () => {
    if (!preview) return
    setBusy(true)
    const res = await uploadMedia({ data: { base64: preview, folder: 'portfolio' } })
    setBusy(false)
    if (res.ok) {
      setResult({ url: res.url, publicId: res.publicId })
      toast.success('Uploaded to Cloudinary')
    } else {
      toast.error('error' in res ? res.error : 'Upload failed')
    }
  }

  const copy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Media"
        description="Upload images to Cloudinary and grab a CDN URL to use anywhere in the site."
      />
      {!cloudinaryConfigured && (
        <Banner>
          Cloudinary isn't configured. Add <code>CLOUDINARY_CLOUD_NAME</code>,{' '}
          <code>CLOUDINARY_API_KEY</code> and <code>CLOUDINARY_API_SECRET</code> to
          your <code>.env</code>.
        </Banner>
      )}

      <Card className="grid gap-6">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid min-h-56 place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 text-center transition-colors hover:border-accent"
        >
          {preview ? (
            <img
              src={preview}
              alt="Upload preview"
              className="max-h-72 rounded-xl object-contain shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ImagePlus className="h-10 w-10" />
              <p className="text-sm font-medium">
                Click to choose an image
              </p>
              <p className="text-xs">PNG, JPG, GIF, WebP or video</p>
            </div>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        {fileName && (
          <p className="truncate text-xs text-muted-foreground">{fileName}</p>
        )}

        <Button onClick={upload} disabled={busy || !preview} size="lg">
          <UploadCloud className="h-4 w-4" />
          {busy ? 'Uploading…' : 'Upload to Cloudinary'}
        </Button>

        {result && (
          <div className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ready to use
            </p>
            <p className="break-all rounded-xl border border-border bg-card p-3 text-sm">
              {result.url}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy URL'}
              </Button>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Open in new tab
              </a>
            </div>
            <p className="break-all text-xs text-muted-foreground">
              Public ID: {result.publicId}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
