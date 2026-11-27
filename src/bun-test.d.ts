// Minimal ambient types for Bun's built-in test runner.
// The project keeps `bun test` as its zero-dependency test runner; this
// declaration lets `tsc --noEmit` typecheck the test files without pulling in
// @types/bun (which would type the whole runtime, not just the runner).
declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void
  export function test(name: string, fn: () => void | Promise<void>): void
  export function beforeEach(fn: () => void | Promise<void>): void
  export function afterEach(fn: () => void | Promise<void>): void
  export function expect(actual: unknown): {
    toBe(expected: unknown): void
    toEqual(expected: unknown): void
    toContain(expected: unknown): void
    toHaveLength(expected: number): void
    rejects: {
      toThrow(message?: string): Promise<void>
    }
    not: {
      toBe(expected: unknown): void
      toEqual(expected: unknown): void
    }
  }
}
