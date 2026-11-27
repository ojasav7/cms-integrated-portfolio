// Run: bun test src/lib/embed.test.ts
// A wrong embed URL renders a blank iframe — a silent content failure, so the
// mapping is pinned here rather than eyeballed in the browser.
import { describe, expect, test } from 'bun:test'
import { computeEmbedUrl } from './embed'

describe('computeEmbedUrl', () => {
  test('maps youtube.com/watch to the privacy-friendly embed host', () => {
    expect(computeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  test('maps youtu.be short links', () => {
    expect(computeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  test('maps shorts and live URLs', () => {
    expect(computeEmbedUrl('https://www.youtube.com/shorts/abcdefghijk')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdefghijk',
    )
    expect(computeEmbedUrl('https://www.youtube.com/live/abcdefghijk')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdefghijk',
    )
  })

  test('maps vimeo links, with and without /video/', () => {
    expect(computeEmbedUrl('https://vimeo.com/76979871')).toBe(
      'https://player.vimeo.com/video/76979871',
    )
    expect(computeEmbedUrl('https://vimeo.com/video/76979871')).toBe(
      'https://player.vimeo.com/video/76979871',
    )
  })

  test('returns an empty string for unsupported or empty input', () => {
    expect(computeEmbedUrl('')).toBe('')
    expect(computeEmbedUrl('   ')).toBe('')
    expect(computeEmbedUrl('https://example.com/video.mp4')).toBe('')
    expect(computeEmbedUrl('not a url')).toBe('')
  })
})
