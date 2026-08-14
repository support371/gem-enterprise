import { describe, expect, it } from "vitest";
import { addPlaybackAutoplay, resolveVideoPlayback } from "@/lib/video/playback";

describe("video playback source resolution", () => {
  it("builds privacy-enhanced YouTube embeds for supported URL forms", () => {
    const watch = resolveVideoPlayback("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    const short = resolveVideoPlayback("https://youtu.be/dQw4w9WgXcQ");
    expect(watch.kind).toBe("youtube");
    expect(watch.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0");
    expect(short.embedUrl).toBe(watch.embedUrl);
  });

  it("builds privacy-aware Vimeo embeds", () => {
    const result = resolveVideoPlayback("https://vimeo.com/123456789");
    expect(result.kind).toBe("vimeo");
    expect(result.embedUrl).toBe("https://player.vimeo.com/video/123456789?dnt=1&playsinline=1");
  });

  it("accepts HTTPS native media and explicitly trusted local previews", () => {
    expect(resolveVideoPlayback("https://media.example/video.mp4").kind).toBe("native");
    expect(resolveVideoPlayback("https://media.example/playback", { providerHint: "native" }).kind).toBe("native");
    expect(resolveVideoPlayback("blob:https://gem.example/id", { allowLocalObjectUrl: true }).kind).toBe("native");
  });

  it("never embeds unknown or unsafe hosts", () => {
    expect(resolveVideoPlayback("https://untrusted.example/watch/123").kind).toBe("external");
    expect(resolveVideoPlayback("javascript:alert(1)").kind).toBe("unsupported");
    expect(resolveVideoPlayback("http://media.example/video.mp4").kind).toBe("unsupported");
    expect(resolveVideoPlayback("blob:https://gem.example/id").kind).toBe("unsupported");
  });

  it("enables autoplay only after the player facade is activated", () => {
    expect(addPlaybackAutoplay("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1"))
      .toContain("autoplay=1");
  });
});
