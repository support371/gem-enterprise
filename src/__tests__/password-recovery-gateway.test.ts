import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const routeSource = readFileSync("src/app/api/auth/forgot-password/route.ts", "utf8")
const gatewaySource = readFileSync("src/lib/supabase-gateway.ts", "utf8")
const resetServiceSource = readFileSync("src/lib/passwordResetService.ts", "utf8")
const resetHandlerSource = readFileSync("src/lib/passwordResetHandler.ts", "utf8")
const forgotPageSource = readFileSync("src/app/forgot-password/page.tsx", "utf8")
const resetPageSource = readFileSync("src/app/reset-password/page.tsx", "utf8")

describe("password recovery gateway routing", () => {
  it("uses the dedicated Supabase recovery gateway when direct database access is unavailable", () => {
    expect(routeSource).toContain("shouldUseSupabaseGateway()")
    expect(routeSource).toContain("requestPasswordRecoveryGateway(email)")
    expect(gatewaySource).toContain('"gem-password-recovery"')
    expect(gatewaySource).toContain('action: "request"')
  })

  it("never claims that an email was sent when delivery is not configured", () => {
    expect(routeSource).toContain("EMAIL_NOT_CONFIGURED_RESPONSE")
    expect(routeSource).toContain("No reset email was sent")
    expect(routeSource).toContain("status: 503")
    expect(routeSource).toContain("emailDeliveryConfigured")
  })

  it("preserves a non-enumerating response when email delivery is active", () => {
    expect(routeSource).toContain("If an active GEM Enterprise account exists")
    expect(routeSource).not.toContain("account exists: true")
    expect(routeSource).not.toContain("account exists: false")
  })

  it("provides platform owners a protected recovery path without exposing a reset token", () => {
    expect(routeSource).toContain("https://admin.gemcybersecurityassist.com")
    expect(forgotPageSource).toContain("Open Command Center recovery")
    expect(forgotPageSource).toContain("Administrator credential recovery")
    expect(routeSource).not.toContain("resetToken:")
  })

  it("completes gateway-issued reset links through the same protected backend", () => {
    expect(gatewaySource).toContain("completePasswordRecoveryGateway")
    expect(gatewaySource).toContain('action: "complete"')
    expect(resetServiceSource).toContain("completePasswordRecoveryGateway")
    expect(resetServiceSource).toContain("shouldUseSupabaseGateway()")
  })

  it("does not duplicate the gateway audit through unavailable Prisma access", () => {
    expect(resetServiceSource).toContain("auditRecorded: true")
    expect(resetHandlerSource).toContain("if (!result.auditRecorded)")
  })

  it("enforces the enterprise password policy in API and UI", () => {
    expect(resetHandlerSource).toContain(".min(14)")
    expect(resetHandlerSource).toContain(".max(128)")
    expect(resetHandlerSource).toContain(".regex(/[A-Z]/)")
    expect(resetPageSource).toContain("minLength={14}")
    expect(resetPageSource).toContain("maxLength={128}")
  })

  it("does not report success when the recovery gateway is unavailable", () => {
    expect(routeSource).toContain("status: 503")
    expect(routeSource).toContain("recovery service is temporarily unavailable")
  })
})
