import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// -- Unit tests for CryptoMarketTable helper functions --

// Test the formatUsd helper (extracted logic for testability)
describe("formatUsd", () => {
  function formatUsd(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${value.toFixed(value < 1 ? 6 : 2)}`;
  }

  it("formats billions correctly", () => {
    expect(formatUsd(1_500_000_000)).toBe("$1.50B");
  });

  it("formats millions correctly", () => {
    expect(formatUsd(42_500_000)).toBe("$42.50M");
  });

  it("formats sub-dollar with 6 decimals", () => {
    expect(formatUsd(0.000123)).toBe("$0.000123");
  });

  it("formats standard price with 2 decimals", () => {
    expect(formatUsd(67.5)).toBe("$67.50");
  });
});

// Test input validation logic matching gem-assist edge function
describe("validateMessages", () => {
  const MAX_MESSAGES = 50;
  const MAX_MESSAGE_CONTENT_LENGTH = 4000;

  function validateMessages(messages: unknown): { valid: boolean; error?: string } {
    if (!Array.isArray(messages)) {
      return { valid: false, error: "messages must be an array" };
    }
    if (messages.length > MAX_MESSAGES) {
      return { valid: false, error: `messages array exceeds maximum of ${MAX_MESSAGES}` };
    }
    for (const msg of messages) {
      if (typeof msg !== "object" || msg === null) {
        return { valid: false, error: "each message must be an object" };
      }
      const { role, content } = msg as Record<string, unknown>;
      if (typeof role !== "string" || !["user", "assistant", "system"].includes(role)) {
        return { valid: false, error: "invalid message role" };
      }
      if (typeof content !== "string") {
        return { valid: false, error: "message content must be a string" };
      }
      if (content.length > MAX_MESSAGE_CONTENT_LENGTH) {
        return { valid: false, error: `message content exceeds maximum of ${MAX_MESSAGE_CONTENT_LENGTH} characters` };
      }
    }
    return { valid: true };
  }

  it("accepts valid messages", () => {
    const result = validateMessages([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
    expect(result.valid).toBe(true);
  });

  it("rejects non-array input", () => {
    const result = validateMessages("not an array");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("messages must be an array");
  });

  it("rejects too many messages", () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: "user",
      content: `msg ${i}`,
    }));
    const result = validateMessages(messages);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds maximum");
  });

  it("rejects invalid role", () => {
    const result = validateMessages([{ role: "admin", content: "hack" }]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid message role");
  });

  it("rejects non-string content", () => {
    const result = validateMessages([{ role: "user", content: 123 }]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("message content must be a string");
  });

  it("rejects oversized content", () => {
    const result = validateMessages([
      { role: "user", content: "x".repeat(4001) },
    ]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds maximum");
  });
});

// Test contact form sanitization logic
describe("sanitizeString", () => {
  function sanitizeString(value: unknown, maxLength: number): string | null {
    if (typeof value !== "string") return null;
    return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLength);
  }

  it("returns null for non-string input", () => {
    expect(sanitizeString(123, 500)).toBeNull();
    expect(sanitizeString(null, 500)).toBeNull();
    expect(sanitizeString(undefined, 500)).toBeNull();
  });

  it("trims whitespace", () => {
    expect(sanitizeString("  hello  ", 500)).toBe("hello");
  });

  it("strips control characters", () => {
    expect(sanitizeString("hello\x00world\x08!", 500)).toBe("helloworld!");
  });

  it("enforces max length", () => {
    expect(sanitizeString("abcdefghij", 5)).toBe("abcde");
  });

  it("preserves normal characters", () => {
    expect(sanitizeString("Hello, World! 123 @#$%", 500)).toBe("Hello, World! 123 @#$%");
  });
});
