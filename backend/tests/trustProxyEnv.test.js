import { describe, it, expect } from "vitest";

import {
  parseTrustProxy,
  TRUST_PROXY_MAX,
} from "../src/config/trustProxy.js";

describe("parseTrustProxy", () => {
  it("defaults to 0 when empty or missing", () => {
    expect(parseTrustProxy(undefined)).toBe(0);
    expect(parseTrustProxy(null)).toBe(0);
    expect(parseTrustProxy("")).toBe(0);
  });

  it('parses "1" to 1', () => {
    expect(parseTrustProxy("1")).toBe(1);
    expect(parseTrustProxy(2)).toBe(2);
  });

  it("rejects negative numbers", () => {
    expect(() => parseTrustProxy("-1")).toThrow(/cannot be negative/i);
    expect(() => parseTrustProxy(-1)).toThrow(/cannot be negative/i);
  });

  it('rejects "true" and other non-integers', () => {
    expect(() => parseTrustProxy("true")).toThrow(/non-negative integer/i);
    expect(() => parseTrustProxy("1.5")).toThrow(/non-negative integer/i);
  });

  it(`rejects values above ${TRUST_PROXY_MAX}`, () => {
    expect(() => parseTrustProxy(String(TRUST_PROXY_MAX + 1))).toThrow(
      /cannot exceed/i
    );
  });
});
