import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const routeSource = readFileSync("src/app/api/auth/forgot-password/route.ts", "utf8")
const gatewaySource = readFileSync("src/lib/supabase-gateway.ts", "utf8")

describe("password recovery gateway routing", () => {
  it("uses the Supabase gateway when no direct database is configured", () => {
    expect(routeSource).toContain("shouldUseSupabaseGateway()")
    expect(routeSource).toContain("requestPasswordRecoveryGateway(email)")
    expect(gatewaySource).toContain('action: "password_recovery_request"')
  })

  it("preserves a non-enumerating success response", () => {
    expect(routeSource).toContain("its recovery request has been recorded")
    expect(routeSource).not.toContain("account exists: true")
  })

  it("does not report success when the recovery gateway is unavailable", () => {
    expect(routeSource).toContain("status: 503")
    expect(routeSource).toContain("recovery service is temporarily unavailable")
  })
})
