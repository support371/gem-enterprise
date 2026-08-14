// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GemVideoPlayer } from "@/components/video/GemVideoPlayer";

describe("GemVideoPlayer", () => {
  it("does not load a third-party frame until the viewer activates playback", () => {
    render(
      <GemVideoPlayer
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="Security briefing"
      />,
    );

    expect(screen.queryByTitle("Security briefing")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Play Security briefing" }));

    const frame = screen.getByTitle("Security briefing");
    expect(frame.getAttribute("src")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(frame.getAttribute("src")).toContain("autoplay=1");
    expect(frame.hasAttribute("allowfullscreen")).toBe(true);
  });

  it("renders native media with mobile playback and caption controls", () => {
    const { container } = render(
      <GemVideoPlayer
        src="https://media.example/briefing.mp4"
        title="Private briefing"
        captionsUrl="/captions/private-briefing.vtt"
      />,
    );
    const video = container.querySelector("video");
    const captions = container.querySelector("track[kind='captions']");
    expect(video?.hasAttribute("controls")).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(captions?.getAttribute("src")).toBe("/captions/private-briefing.vtt");
  });

  it("fails closed without creating links for unsafe fallback URLs", () => {
    render(
      <GemVideoPlayer
        src="javascript:alert(1)"
        externalUrl="javascript:alert(2)"
        title="Unsafe video"
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/not supplied a directly playable video format/i)).toBeTruthy();
  });
});
