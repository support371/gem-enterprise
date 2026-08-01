import { describe, expect, it } from "vitest";
import { avatarConfigs, voiceConfigs } from "@/lib/video-data/avatars";
import { videoScripts } from "@/lib/video-data/scripts";

const prohibitedClaims = [
  /24\/7/i,
  /guaranteed response/i,
  /zero findings/i,
  /60% reduction/i,
  /200 hours/i,
  /verified human advisor/i,
];

describe("governed video library", () => {
  it("keeps every script connected to an approved avatar and voice placeholder", () => {
    const avatarIds = new Set(avatarConfigs.map((avatar) => avatar.id));
    const voiceIds = new Set(voiceConfigs.map((voice) => voice.id));

    for (const script of videoScripts) {
      expect(avatarIds.has(script.avatarId), `${script.id} avatar`).toBe(true);
      expect(voiceIds.has(script.voiceId), `${script.id} voice`).toBe(true);
      expect(script.disclosure.length).toBeGreaterThan(20);
    }
  });

  it("keeps provider-dependent production claims gated", () => {
    const copy = videoScripts.map((script) => `${script.title}\n${script.script}\n${script.disclosure}`).join("\n");

    for (const claim of prohibitedClaims) {
      expect(copy).not.toMatch(claim);
    }

    expect(copy).toMatch(/fail closed/i);
    expect(copy).toMatch(/owner approval/i);
  });
});
