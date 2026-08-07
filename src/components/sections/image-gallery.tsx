import { useState } from 'react'
import type { GalleryAsset } from '@/lib/cms/types'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

interface ImageGallerySectionProps {
  assets: GalleryAsset[]
}

export function ImageGallerySection({ assets }: ImageGallerySectionProps) {
  if (!assets.length) return null
  const portrait = assets.filter((a) => a.ratio < 1)
  const banner = assets.filter((a) => a.ratio >= 1)

  return (
    <section id="gallery" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Gallery"
          title="From the studio"
          description="Still frames, art direction and details. Rails auto-size to each image's true aspect ratio."
        />
      </div>

      {portrait.length > 0 && (
        <Rail label="Portrait rail" items={portrait} tall />
      )}
      {banner.length > 0 && <Rail label="Banner rail" items={banner} />}
    </section>
  )
}

function Rail({
  label,
  items,
  tall,
}: {
  label: string
  items: GalleryAsset[]
  tall?: boolean
}) {
  return (
    <div className="mt-12">
      <p className="mb-5 px-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground md:px-10">
        {label}
      </p>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:px-10">
        {items.map((asset) => (
          <figure
            key={asset.src}
            className={cn(
              'group relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card',
              tall ? 'h-80 max-w-[min(70vw,20rem)] md:h-[26rem]' : 'h-64 max-w-[min(85vw,30rem)] md:h-72',
            )}
            style={{ aspectRatio: asset.ratio }}
          >
            <SmartImage asset={asset} />
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-sm font-medium text-white">{asset.alt}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/** Detects the real aspect ratio of an image once loaded. */
function SmartImage({ asset }: { asset: GalleryAsset }) {
  const [detected, setDetected] = useState<number | null>(null)
  const ratio = detected ?? asset.ratio

  return (
    <img
      src={asset.src}
      alt={asset.alt}
      loading="lazy"
      style={{ aspectRatio: ratio }}
      onLoad={(e) => {
        const { naturalWidth, naturalHeight } = e.currentTarget
        if (naturalWidth && naturalHeight) {
          setDetected(naturalWidth / naturalHeight)
        }
      }}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
    />
  )
}
