import { ArrowUp, Lock } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { SiteConfig } from '@/lib/cms/types'

export function Footer({ site }: { site: SiteConfig }) {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="text-sm text-muted-foreground">{site.footer.copyright}</p>

        <div className="flex items-center gap-2">
          {site.footer.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {social.label}
            </a>
          ))}
          <Link
            to="/admin"
            className="ml-2 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
            aria-label="Admin"
          >
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="group inline-flex h-10 w-10 items-center justify-center self-start rounded-full border border-border transition-all hover:border-accent hover:text-accent md:self-auto"
        >
          <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  )
}
