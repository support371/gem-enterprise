import { describe, expect, it } from 'vitest'
import { platformOrigins } from './platform-origins'

describe('enterprise platform origins', () => {
  it('keeps the existing authenticated client entry canonical', () => {
    expect(platformOrigins.clientLogin).toBe('/client-login')
  })

  it('uses the verified GEM production domains', () => {
    expect(platformOrigins.publicWebsite).toBe('https://www.gemcybersecurityassist.com')
    expect(platformOrigins.enterpriseSolutions).toBe('https://gem-assist-enterprise.vercel.app')
    expect(platformOrigins.adminCommandCenter).toBe('/app/command-center')
    expect(platformOrigins.publicCommandCenterRoute).toBe('/command-center')
  })
})
