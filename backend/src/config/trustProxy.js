/**
 * Parses TRUST_PROXY for Express (number of proxy hops).
 * Empty / missing → 0. Rejects non-integers, negatives, and values > 3.
 */
export const TRUST_PROXY_MAX = 3;

export function parseTrustProxy(raw) {
  if (raw === undefined || raw === null || raw === "") {
    return 0;
  }

  const value = Number(raw);

  if (!Number.isInteger(value)) {
    throw new Error(
      "TRUST_PROXY must be a non-negative integer number of proxy hops."
    );
  }

  if (value < 0) {
    throw new Error("TRUST_PROXY cannot be negative.");
  }

  if (value > TRUST_PROXY_MAX) {
    throw new Error(`TRUST_PROXY cannot exceed ${TRUST_PROXY_MAX}.`);
  }

  return value;
}
