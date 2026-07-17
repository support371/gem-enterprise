import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

const bcryptMocks = vi.hoisted(() => ({
  hash: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: dbMocks.transaction,
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: bcryptMocks.hash,
  },
}));

import {
  AdminAccessConsumptionError,
  consumeAdminAccessToken,
} from "@/lib/admin-access-consumer";

const requestId = `aar_${"7".repeat(32)}`;
const accessToken = `${requestId}.${"a".repeat(64)}`;
const password = "Strong-Administrator-Password-2026!";
const passwordHash = `$2b$12$${"x".repeat(53)}`;

type SqlQuery = {
  values: unknown[];
  text: string;
};

function transactionHarness() {
  const transaction = {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };
  dbMocks.transaction.mockImplementation(
    async (callback: (value: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  );
  return transaction;
}

describe("direct database administrator access consumer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptMocks.hash.mockResolvedValue(passwordHash);
  });

  it("atomically consumes a request-bound token without sending plaintext credentials", async () => {
    const transaction = transactionHarness();
    transaction.$queryRaw
      .mockResolvedValueOnce([{ id: "token-1", userId: "admin-1" }])
      .mockResolvedValueOnce([
        { id: "admin-1", email: "admin@gemcybersecurityassist.com" },
      ]);
    transaction.$executeRaw
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);

    await expect(
      consumeAdminAccessToken(accessToken, password, requestId),
    ).resolves.toEqual({
      ok: true,
      email: "admin@gemcybersecurityassist.com",
      loginPath: "/client-login",
    });

    const expectedTokenHash = createHash("sha256")
      .update(accessToken)
      .digest("hex");
    const tokenQuery = transaction.$queryRaw.mock.calls[0][0] as SqlQuery;
    expect(tokenQuery.values).toContain(expectedTokenHash);
    expect(tokenQuery.values).toContain(requestId);
    expect(tokenQuery.values).not.toContain(accessToken);

    const passwordUpdate = transaction.$executeRaw.mock.calls[0][0] as SqlQuery;
    expect(passwordUpdate.values).toContain(passwordHash);
    expect(passwordUpdate.values).not.toContain(password);
    expect(bcryptMocks.hash).toHaveBeenCalledWith(password, 12);
    expect(dbMocks.transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" }),
    );
  });

  it("rejects a capability whose embedded request ID does not match", async () => {
    await expect(
      consumeAdminAccessToken(
        accessToken,
        password,
        `aar_${"8".repeat(32)}`,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_TOKEN",
    } satisfies Partial<AdminAccessConsumptionError>);

    expect(bcryptMocks.hash).not.toHaveBeenCalled();
    expect(dbMocks.transaction).not.toHaveBeenCalled();
  });

  it("fails closed for expired or reused tokens", async () => {
    const transaction = transactionHarness();
    transaction.$queryRaw.mockResolvedValueOnce([]);

    await expect(
      consumeAdminAccessToken(accessToken, password, requestId),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_TOKEN",
    } satisfies Partial<AdminAccessConsumptionError>);

    expect(transaction.$executeRaw).not.toHaveBeenCalled();
  });

  it("fails closed when the token is not tied to the active canonical owner", async () => {
    const transaction = transactionHarness();
    transaction.$queryRaw
      .mockResolvedValueOnce([{ id: "token-1", userId: "user-2" }])
      .mockResolvedValueOnce([]);

    await expect(
      consumeAdminAccessToken(accessToken, password, requestId),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_TOKEN",
    } satisfies Partial<AdminAccessConsumptionError>);

    expect(transaction.$executeRaw).not.toHaveBeenCalled();
  });

  it("rejects concurrent or already-completed consumption", async () => {
    const transaction = transactionHarness();
    transaction.$queryRaw
      .mockResolvedValueOnce([{ id: "token-1", userId: "admin-1" }])
      .mockResolvedValueOnce([
        { id: "admin-1", email: "admin@gemcybersecurityassist.com" },
      ]);
    transaction.$executeRaw
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    await expect(
      consumeAdminAccessToken(accessToken, password, requestId),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "TOKEN_CONSUMPTION_CONFLICT",
    } satisfies Partial<AdminAccessConsumptionError>);
  });

  it("maps database serialization conflicts to a safe retryable response", async () => {
    dbMocks.transaction.mockRejectedValue({ code: "P2034" });

    await expect(
      consumeAdminAccessToken(accessToken, password, requestId),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "TOKEN_CONSUMPTION_CONFLICT",
    } satisfies Partial<AdminAccessConsumptionError>);
  });
});
