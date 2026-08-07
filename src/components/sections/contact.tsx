import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import type { SiteConfig } from '@/lib/cms/types'
import { fadeUp, stagger, viewport } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

interface ContactSectionProps {
  site: SiteConfig
}

export function ContactSection({ site }: ContactSectionProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(
      `Project inquiry from ${name || 'your website'}`,
    )
    const body = encodeURIComponent(
      `Hi there,\n\n${message || 'I would love to talk about a project.'}\n\n— ${name || ''}\n${email || ''}`.trim(),
    )
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="overflow-hidden rounded-[2.5rem] bg-ink text-background"
        >
          <div className="pointer-events-none absolute" aria-hidden="true" />
          <div className="grid gap-12 p-8 md:p-16 lg:grid-cols-2 lg:gap-20">
            <div>
              <motion.p
                variants={fadeUp}
                className="text-xs font-medium uppercase tracking-[0.3em] text-accent"
              >
                {site.contact.eyebrow}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-4 font-display text-4xl font-medium tracking-tight text-balance md:text-5xl"
              >
                {site.contact.headline}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-md text-base leading-relaxed text-background/60"
              >
                {site.contact.blurb}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4">
                <a
                  href={`mailto:${site.contact.email}`}
                  className="group inline-flex items-center gap-3 text-lg font-medium"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-background/20 transition-colors group-hover:border-accent">
                    <Mail className="h-4.5 w-4.5 text-accent" />
                  </span>
                  {site.contact.email}
                  <ArrowUpRight className="h-4 w-4 text-background/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                {site.contact.location && (
                  <p className="inline-flex items-center gap-3 text-sm text-background/50">
                    <MapPin className="h-4 w-4" />
                    {site.contact.location}
                  </p>
                )}
              </motion.div>
            </div>

            <motion.form
              variants={fadeUp}
              onSubmit={onSubmit}
              className="flex flex-col gap-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  dark
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  dark
                  required
                />
              </div>
              <Textarea
                label="About your project"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What are you building, and when do you need it?"
                rows={5}
                dark
              />
              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" variant="accent" size="lg">
                  Send inquiry
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-background/40">
                  Opens your mail app with a pre-filled draft — nothing is sent
                  until you hit send.
                </p>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
