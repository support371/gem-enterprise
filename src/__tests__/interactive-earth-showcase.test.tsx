// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InteractiveEarthShowcase } from "@/components/home/InteractiveEarthShowcase";

function matchMedia(matches: boolean) {
  return vi.fn().mockImplementation(() => ({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("InteractiveEarthShowcase", () => {
  it("rotates by default and lets a visitor pause and restart it", () => {
    vi.stubGlobal("matchMedia", matchMedia(false));
    render(<InteractiveEarthShowcase />);

    const pauseButton = screen.getByRole("button", { name: "Pause rotating Earth" });
    expect(pauseButton.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(pauseButton);
    const startButton = screen.getByRole("button", { name: "Start rotating Earth" });
    expect(startButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(startButton);
    expect(screen.getByRole("button", { name: "Pause rotating Earth" })).toBeTruthy();
  });

  it("stops motion and disables the control when reduced motion is preferred", async () => {
    vi.stubGlobal("matchMedia", matchMedia(true));
    render(<InteractiveEarthShowcase />);

    const control = await screen.findByRole("button", {
      name: "Earth animation paused to respect reduced-motion settings",
    });
    await waitFor(() => expect(control.hasAttribute("disabled")).toBe(true));
    expect(control.getAttribute("aria-pressed")).toBe("false");
  });
});
