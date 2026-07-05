import { afterEach, describe, expect, it } from "vitest";
import {
  calculateTikTokChunkPlan,
  chunkByteRange,
} from "@/lib/tokmetric/publishing/types";
import { validateVerifiedMediaUrl } from "@/lib/tokmetric/publishing/service";

const originalHosts = process.env.TOKMETRIC_VERIFIED_MEDIA_HOSTS;

afterEach(() => {
  if (originalHosts === undefined) delete process.env.TOKMETRIC_VERIFIED_MEDIA_HOSTS;
  else process.env.TOKMETRIC_VERIFIED_MEDIA_HOSTS = originalHosts;
});

describe("TikTok video upload planning", () => {
  it("uploads files smaller than 5 MiB as one complete chunk", () => {
    const plan = calculateTikTokChunkPlan(2 * 1024 * 1024);
    expect(plan).toEqual({
      videoSize: 2 * 1024 * 1024,
      chunkSize: 2 * 1024 * 1024,
      totalChunkCount: 1,
    });
    expect(chunkByteRange(plan, 0)).toEqual({
      start: 0,
      end: 2 * 1024 * 1024 - 1,
      length: 2 * 1024 * 1024,
    });
  });

  it("keeps a 64 MiB video as one valid chunk", () => {
    const size = 64 * 1024 * 1024;
    expect(calculateTikTokChunkPlan(size)).toEqual({
      videoSize: size,
      chunkSize: size,
      totalChunkCount: 1,
    });
  });

  it("uses at least two chunks immediately above 64 MiB", () => {
    const size = 65 * 1024 * 1024;
    const plan = calculateTikTokChunkPlan(size);
    expect(plan.totalChunkCount).toBe(2);
    expect(chunkByteRange(plan, 0).length).toBeLessThanOrEqual(64 * 1024 * 1024);
    expect(chunkByteRange(plan, 1).end).toBe(size - 1);
  });

  it("uses sequential chunks and merges the trailing bytes into the final request", () => {
    const videoSize = 150 * 1024 * 1024;
    const plan = calculateTikTokChunkPlan(videoSize);
    expect(plan.totalChunkCount).toBe(2);
    expect(chunkByteRange(plan, 0).start).toBe(0);
    const final = chunkByteRange(plan, 1);
    expect(final.end).toBe(videoSize - 1);
    expect(final.length).toBe(videoSize - plan.chunkSize);
  });

  it("rejects files larger than TikTok's 4 GB maximum", () => {
    expect(() => calculateTikTokChunkPlan(4 * 1024 * 1024 * 1024 + 1)).toThrow(/4 GB/);
  });
});

describe("TikTok verified media URL controls", () => {
  it("accepts HTTPS URLs on configured domains and subdomains", () => {
    process.env.TOKMETRIC_VERIFIED_MEDIA_HOSTS = "gemcybersecurityassist.com";
    expect(validateVerifiedMediaUrl("https://media.gemcybersecurityassist.com/videos/demo.mp4").hostname)
      .toBe("media.gemcybersecurityassist.com");
  });

  it("rejects unverified domains and URL credentials", () => {
    process.env.TOKMETRIC_VERIFIED_MEDIA_HOSTS = "gemcybersecurityassist.com";
    expect(() => validateVerifiedMediaUrl("https://example.com/demo.mp4")).toThrow(/approved TikTok URL property/);
    expect(() => validateVerifiedMediaUrl("https://user:pass@gemcybersecurityassist.com/demo.mp4")).toThrow(/without credentials/);
  });

  it("fails closed when no verified media hosts are configured", () => {
    delete process.env.TOKMETRIC_VERIFIED_MEDIA_HOSTS;
    expect(() => validateVerifiedMediaUrl("https://gemcybersecurityassist.com/demo.mp4")).toThrow(/disabled/);
  });
});
