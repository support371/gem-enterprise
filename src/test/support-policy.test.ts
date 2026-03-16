import { describe, expect, it } from "vitest";
import { orchestrateSupportReply, resolveQueue } from "@/services/support/policy";

describe("support policy", () => {
  it("escalates incident keywords", () => {
    const reply = orchestrateSupportReply("We were hacked and need help");
    expect(reply.escalated).toBe(true);
    expect(reply.queue).toBe("Cybersecurity / Incident");
  });

  it("routes booking keywords", () => {
    expect(resolveQueue("book consultation")).toBe("Consultation Scheduling");
  });
});
