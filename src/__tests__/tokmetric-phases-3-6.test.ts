import { describe, expect, it } from "vitest";
import { getTokMetricAgent, validateAgentOutput } from "@/lib/tokmetric/agents";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import { contentHash, TokMetricError } from "@/lib/tokmetric/security";

function requestWithToken(token?: string) {
  return new Request("https://example.test/functions/tokmetric/context", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }) as any;
}

describe("TokMetric phases 3-6 foundation", () => {
  it("keeps content hashes stable across object key order", () => {
    expect(contentHash({ script: "hello", caption: "world" })).toBe(contentHash({ caption: "world", script: "hello" }));
  });

  it("keeps registered agents draft-only", () => {
    const agent = getTokMetricAgent("publishing_coordinator");
    expect(agent.canPublish).toBe(false);
    expect(agent.requiresHumanApproval).toBe(true);
  });

  it("rejects unsupported agent output types", () => {
    expect(() => validateAgentOutput("script_writer", "external_submit")).toThrow(TokMetricError);
  });

  it("requires GPT auth to be configured", () => {
    const previous = process.env.GPT_AUTH_TOKEN;
    delete process.env.GPT_AUTH_TOKEN;
    expect(() => requireTokMetricGptAuth(requestWithToken("anything"))).toThrow(TokMetricError);
    if (previous !== undefined) process.env.GPT_AUTH_TOKEN = previous;
  });

  it("accepts the configured GPT bearer token", () => {
    const previous = process.env.GPT_AUTH_TOKEN;
    process.env.GPT_AUTH_TOKEN = "test-token";
    expect(requireTokMetricGptAuth(requestWithToken("test-token"))).toEqual({ principal: "tokmetric-gpt", mode: "server_to_server" });
    if (previous === undefined) delete process.env.GPT_AUTH_TOKEN;
    else process.env.GPT_AUTH_TOKEN = previous;
  });

  it("rejects the wrong GPT bearer token", () => {
    const previous = process.env.GPT_AUTH_TOKEN;
    process.env.GPT_AUTH_TOKEN = "test-token";
    expect(() => requireTokMetricGptAuth(requestWithToken("wrong"))).toThrow(TokMetricError);
    if (previous === undefined) delete process.env.GPT_AUTH_TOKEN;
    else process.env.GPT_AUTH_TOKEN = previous;
  });
});
