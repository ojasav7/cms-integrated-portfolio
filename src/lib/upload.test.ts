// Run: bun test src/lib/upload.test.ts
// The dropzone's only pure decision: which file a drop carries. The JSX wiring
// around it is read-verified, not covered here (no DOM in this test setup).
import { describe, expect, test } from 'bun:test'
import { pickDroppedFile } from './upload'

describe('pickDroppedFile', () => {
  test('returns the first file of a drop', () => {
    const first = new File(['a'], 'a.png', { type: 'image/png' })
    const second = new File(['b'], 'b.png', { type: 'image/png' })

    expect(pickDroppedFile([first, second])).toBe(first)
  })

  test('returns null when a drop carries no files', () => {
    expect(pickDroppedFile(null)).toBe(null)
    expect(pickDroppedFile(undefined)).toBe(null)
    expect(pickDroppedFile([])).toBe(null)
  })
})
