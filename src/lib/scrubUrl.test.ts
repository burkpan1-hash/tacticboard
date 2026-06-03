import { describe, it, expect } from 'vitest'
import { scrubUrl } from './scrubUrl'

describe('scrubUrl', () => {
  it('redacts a verify-email token in a relative URL', () => {
    const out = scrubUrl('/verify-email?token=abc123')
    expect(out).toBe('/verify-email?token=%5BFiltered%5D')
  })

  it('redacts a reset-password token in an absolute URL', () => {
    const out = scrubUrl('https://basketballtacticboard.com/reset-password?token=xyz')
    expect(out).toBe('https://basketballtacticboard.com/reset-password?token=%5BFiltered%5D')
  })

  it('redacts multiple sensitive params and leaves benign ones', () => {
    const out = scrubUrl('/x?lang=en&token=abc&utm_source=tw&code=zzz')
    // Order is preserved by URLSearchParams iteration; both sensitive params filtered.
    expect(out).toContain('lang=en')
    expect(out).toContain('utm_source=tw')
    expect(out).toContain('token=%5BFiltered%5D')
    expect(out).toContain('code=%5BFiltered%5D')
    expect(out).not.toContain('abc')
    expect(out).not.toContain('zzz')
  })

  it('returns the input unchanged when there are no sensitive params', () => {
    expect(scrubUrl('/editor/abc?cloud=1')).toBe('/editor/abc?cloud=1')
  })

  it('handles param names case-insensitively', () => {
    const out = scrubUrl('/x?TOKEN=abc')
    expect(out).toContain('TOKEN=%5BFiltered%5D')
    expect(out).not.toContain('abc')
  })

  it('redacts access_token and refresh_token (OAuth callbacks)', () => {
    const out = scrubUrl('/cb?access_token=aaa&refresh_token=rrr')
    expect(out).toContain('access_token=%5BFiltered%5D')
    expect(out).toContain('refresh_token=%5BFiltered%5D')
    expect(out).not.toMatch(/aaa|rrr/)
  })

  it('returns empty string for empty input', () => {
    expect(scrubUrl('')).toBe('')
    expect(scrubUrl(undefined)).toBe('')
    expect(scrubUrl(null)).toBe('')
  })

  it('preserves the hash fragment', () => {
    const out = scrubUrl('/page?token=abc#section')
    expect(out).toContain('#section')
    expect(out).not.toContain('abc')
  })

  it('returns malformed input unchanged (better to leak a bad URL than drop the crumb)', () => {
    // A truly unparseable input — empty path with control char that breaks URL ctor
    const broken = '\x00://malformed'
    expect(scrubUrl(broken)).toBe(broken)
  })
})
