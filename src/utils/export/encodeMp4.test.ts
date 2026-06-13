import { describe, it, expect } from 'vitest'
import { isVideoExportSupported } from './encodeMp4'

describe('isVideoExportSupported', () => {
  it('returns false in the jsdom test environment (no WebCodecs)', () => {
    expect(isVideoExportSupported()).toBe(false)
  })
})
