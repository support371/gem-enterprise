import { describe, expect, it } from 'vitest'
import { platformOrigins } from './platform-origins'

describe('enterprise platform origins', () => {
  it('uses the neutral identity gateway as the public sign-in entry', () => {
    expect(platformOrigins.clientLogin).toBe('/login')
  })

  it('uses the verified GEM production domains', () => {
    expect(platformOrigins.publicWebsite).toBe('https://www.gemcybersecurityassist.com')
    expect(platformOrigins.enterpriseSolutions).toBe('https://gem-assist-enterprise.vercel.app')
    expect(platformOrigins.identityGateway).toBe('https://auth.gemcybersecurityassist.com')
    expect(platformOrigins.clientPortal).toBe('https://portal.gemcybersecurityassist.com')
    expect(platformOrigins.teamWorkspace).toBe('https://team.gemcybersecurityassist.com')
    expect(platformOrigins.adminConsole).toBe('https://admin.gemcybersecurityassist.com')
    expect(platformOrigins.ownerControlPlane).toBe('https://control.gemcybersecurityassist.com')
    expect(platformOrigins.appLauncher).toBe('https://apps.gemcybersecurityassist.com')
    expect(platformOrigins.adminCommandCenter).toBe('https://admin.gemcybersecurityassist.com')
    expect(platformOrigins.publicCommandCenterRoute).toBe('/command-center')
  })
})
