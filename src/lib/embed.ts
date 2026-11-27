/**
 * Video embed URL derivation — pure so it can be tested without booting
 * TanStack Start (the module that uses it is a server-fn factory).
 */

/** Convert a YouTube / Vimeo URL into an embeddable iframe URL. */
export function computeEmbedUrl(input: string): string {
  const url = input.trim()
  if (!url) return ''

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/,
  )
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return ''
}
