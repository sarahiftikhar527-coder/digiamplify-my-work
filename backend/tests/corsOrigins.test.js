import { describe, it, expect, afterEach, vi } from "vitest";

import {
  DEFAULT_DEV_ORIGINS,
  normalizeOriginEntry,
  parseClientUrlOrigins,
  resolveAllowedOrigins,
} from "../src/config/clientOrigins.js";

describe("clientOrigins", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to localhost origins in development when CLIENT_URL is empty", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CLIENT_URL", "");

    expect(
      resolveAllowedOrigins(process.env.CLIENT_URL, process.env.NODE_ENV)
    ).toEqual(DEFAULT_DEV_ORIGINS);
  });

  it("defaults to localhost origins in test when CLIENT_URL is empty", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("CLIENT_URL", "");

    expect(
      resolveAllowedOrigins(process.env.CLIENT_URL, process.env.NODE_ENV)
    ).toEqual(DEFAULT_DEV_ORIGINS);
  });

  it("fails in production when CLIENT_URL is empty", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLIENT_URL", "");

    expect(() =>
      resolveAllowedOrigins(process.env.CLIENT_URL, process.env.NODE_ENV)
    ).toThrow(/at least one allowed origin/i);
  });

  it('rejects "*" and "null" as origins', () => {
    expect(() => normalizeOriginEntry("*")).toThrow(/Invalid CLIENT_URL origin/i);
    expect(() => normalizeOriginEntry("null")).toThrow(
      /Invalid CLIENT_URL origin/i
    );
  });

  it("normalizes trailing slash to URL origin", () => {
    expect(normalizeOriginEntry("http://localhost:5173/")).toBe(
      "http://localhost:5173"
    );
  });

  it("rejects path, query, and hash in CLIENT_URL entries", () => {
    expect(() =>
      normalizeOriginEntry("http://localhost:5173/admin")
    ).toThrow(/must not include a path/i);

    expect(() =>
      normalizeOriginEntry("http://localhost:5173?foo=1")
    ).toThrow(/query string/i);

    expect(() =>
      normalizeOriginEntry("http://localhost:5173#section")
    ).toThrow(/hash/i);
  });

  it("parses comma-separated origins with deduplication", () => {
    expect(
      parseClientUrlOrigins(
        "http://localhost:5173/, http://localhost:5173,https://app.example.com"
      )
    ).toEqual(["http://localhost:5173", "https://app.example.com"]);
  });
});

describe("corsOptions origin callback", () => {
  it("allows missing Origin and denies unlisted origins without throwing", async () => {
    const { corsOptions, allowedOrigins } = await import(
      "../src/config/cors.js"
    );

    expect(Array.isArray(allowedOrigins)).toBe(true);
    expect(allowedOrigins.length).toBeGreaterThan(0);

    const allowNoOrigin = await new Promise((resolve, reject) => {
      corsOptions.origin(undefined, (err, allowed) => {
        if (err) reject(err);
        else resolve(allowed);
      });
    });

    expect(allowNoOrigin).toBe(true);

    const denyUnknown = await new Promise((resolve, reject) => {
      corsOptions.origin("https://evil.example.com", (err, allowed) => {
        if (err) reject(err);
        else resolve(allowed);
      });
    });

    expect(denyUnknown).toBe(false);
  });
});
