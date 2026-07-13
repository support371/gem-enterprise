import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync("src/app/api/contact/route.ts", "utf8");
const clientSource = readFileSync("src/lib/contact-gateway.ts", "utf8");
const functionSource = readFileSync(
  "supabase/functions/gem-contact-gateway/index.ts",
  "utf8",
);
const formSource = readFileSync("src/app/contact/ContactForm.tsx", "utf8");

describe("controlled launch contact intake", () => {
  it("uses the Supabase gateway when direct database access is unavailable", () => {
    expect(routeSource).toContain("shouldUseSupabaseGateway()");
    expect(routeSource).toContain("submitContactGateway({");
    expect(routeSource.indexOf("shouldUseSupabaseGateway()")).toBeLessThan(
      routeSource.indexOf("db.supportBooking.create"),
    );
  });

  it("keeps Prisma as the preferred direct-database path", () => {
    expect(routeSource).toContain("db.supportBooking.create");
    expect(routeSource).toContain('persistence: "prisma"');
  });

  it("does not report success when the gateway cannot persist the message", () => {
    expect(clientSource).toContain("if (!response.ok");
    expect(clientSource).toContain("CONTACT_GATEWAY_UNAVAILABLE");
    expect(routeSource).toContain("Your message could not be stored");
    expect(routeSource).toContain("{ status: 503 }");
  });

  it("stores the enquiry before sending an optional notification", () => {
    expect(functionSource.indexOf('.from("support_bookings").insert')).toBeLessThan(
      functionSource.indexOf("await sendNotification"),
    );
    expect(functionSource).toContain("Notification delivery: pending");
    expect(functionSource).toContain("notificationDelivery");
  });

  it("applies spam controls and records an audit event", () => {
    expect(functionSource).toContain("MAX_SUBMISSIONS_PER_EMAIL_PER_HOUR");
    expect(functionSource).toContain('code: "RATE_LIMITED"');
    expect(functionSource).toContain('resource: "contact_message"');
    expect(functionSource).toContain('source: "supabase_contact_gateway"');
  });

  it("retains the honeypot and accurate success wording", () => {
    expect(routeSource).toContain("Honeypot submissions");
    expect(formSource).toContain("accepted by our contact system");
    expect(formSource).not.toContain("guaranteed response");
  });
});
