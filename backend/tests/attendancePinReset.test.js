import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import crypto from "node:crypto";
import mongoose from "mongoose";

import {
  pinForgotSchema,
  pinResetSchema,
} from "../src/modules/attendance/attendance.validation.js";

const validToken = "a".repeat(64);

describe("attendance.validation pin reset", () => {
  it("accepts a valid forgot payload", () => {
    const result = pinForgotSchema.safeParse({
      body: { email: "user@example.com" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid forgot payloads", () => {
    const result = pinForgotSchema.safeParse({
      body: { email: "not-an-email", extra: true },
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid reset payload", () => {
    const result = pinResetSchema.safeParse({
      body: { token: validToken, newPin: "1234" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects short tokens and non-numeric pins", () => {
    const badToken = pinResetSchema.safeParse({
      body: { token: "abc", newPin: "1234" },
    });

    const badPin = pinResetSchema.safeParse({
      body: { token: validToken, newPin: "12ab" },
    });

    expect(badToken.success).toBe(false);
    expect(badPin.success).toBe(false);
  });
});

const userFindOneMock = vi.fn();

vi.mock("../src/models/User.js", () => ({
  default: {
    findOne: (...args) => userFindOneMock(...args),
  },
}));

vi.mock("../src/models/Task.js", () => ({
  default: {},
}));

vi.mock("../src/models/Calendar.js", () => ({
  default: {},
}));

vi.mock("../src/modules/attendance/attendance.model.js", () => ({
  default: {},
}));

vi.mock("../src/config/env.js", () => ({
  env: { FRONTEND_URL: "http://localhost:5174" },
}));

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const mockFindOneSelect = (doc) => ({
  select: vi.fn().mockResolvedValue(doc),
});

const { requestPinReset, resetPin } = await import(
  "../src/modules/attendance/attendance.service.js"
);

describe("attendance.service pin reset (mocked User)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
      })
    );
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const runForgot = async (email) => {
    const promise = requestPinReset(email);
    await vi.runAllTimersAsync();
    return promise;
  };

  it("stores SHA-256 hash on forgot, never the raw token", async () => {
    const fixedBytes = Buffer.alloc(32, 0xab);
    vi.spyOn(crypto, "randomBytes").mockReturnValue(fixedBytes);

    const rawToken = fixedBytes.toString("hex");
    const expectedHash = hashToken(rawToken);

    const user = {
      email: "user@example.com",
      pinResetTokenHash: undefined,
      pinResetExpires: undefined,
      save: vi.fn(async function save() {
        return this;
      }),
    };

    userFindOneMock.mockImplementation((query) => {
      if (query.email) {
        return mockFindOneSelect(user);
      }

      return mockFindOneSelect(null);
    });

    await runForgot("user@example.com");

    expect(user.pinResetTokenHash).toBe(expectedHash);
    expect(user.pinResetTokenHash).not.toBe(rawToken);
    expect(user.save).toHaveBeenCalledTimes(1);

    crypto.randomBytes.mockRestore();
  });

  it("valid token resets PIN once and clears reset fields in the same save", async () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    const user = {
      _id: new mongoose.Types.ObjectId(),
      pinHash: "old-hash",
      pinResetTokenHash: tokenHash,
      pinResetExpires: new Date(Date.now() + 60_000),
      save: vi.fn(async function save() {
        return this;
      }),
    };

    userFindOneMock.mockImplementation((query) => {
      if (query.email) {
        return mockFindOneSelect(user);
      }

      return {
        select: () =>
          Promise.resolve(
            query.pinResetTokenHash === tokenHash &&
              user.pinResetExpires > new Date()
              ? user
              : null
          ),
      };
    });

    await resetPin(rawToken, "5678");

    expect(user.pinHash).not.toBe("old-hash");
    expect(user.pinResetTokenHash).toBeUndefined();
    expect(user.pinResetExpires).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it("rejects the same token on a second reset attempt", async () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    const user = {
      pinHash: "old-hash",
      pinResetTokenHash: tokenHash,
      pinResetExpires: new Date(Date.now() + 60_000),
      save: vi.fn(async function save() {
        this.pinResetTokenHash = undefined;
        this.pinResetExpires = undefined;
        return this;
      }),
    };

    userFindOneMock.mockImplementation((query) => ({
      select: () =>
        Promise.resolve(
          query.pinResetTokenHash === tokenHash &&
            user.pinResetTokenHash &&
            user.pinResetExpires > new Date()
            ? user
            : null
        ),
    }));

    await resetPin(rawToken, "5678");

    await expect(resetPin(rawToken, "5678")).rejects.toMatchObject({
      code: "INVALID_RESET_TOKEN",
    });
  });

  it("rejects an expired token", async () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    userFindOneMock.mockImplementation((query) => {
      if (query.pinResetTokenHash === tokenHash) {
        return mockFindOneSelect(null);
      }

      return mockFindOneSelect(null);
    });

    await expect(resetPin(rawToken, "5678")).rejects.toMatchObject({
      code: "INVALID_RESET_TOKEN",
    });
  });

  it("rejects a token superseded by a newer forgot request", async () => {
    const oldRaw = crypto.randomBytes(32).toString("hex");
    const newRaw = crypto.randomBytes(32).toString("hex");
    const newHash = hashToken(newRaw);

    const user = {
      email: "user@example.com",
      pinResetTokenHash: newHash,
      pinResetExpires: new Date(Date.now() + 60_000),
      save: vi.fn(async function save() {
        return this;
      }),
    };

    userFindOneMock.mockImplementation((query) => {
      if (query.email) {
        return mockFindOneSelect(user);
      }

      return {
        select: () =>
          Promise.resolve(
            query.pinResetTokenHash === user.pinResetTokenHash ? user : null
          ),
      };
    });

    await runForgot("user@example.com");

    await expect(resetPin(oldRaw, "5678")).rejects.toMatchObject({
      code: "INVALID_RESET_TOKEN",
    });
  });
});
