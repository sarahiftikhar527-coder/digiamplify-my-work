export const DEFAULT_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
];

const FORBIDDEN_ORIGIN_LITERALS = new Set(["*", "null"]);

export function normalizeOriginEntry(raw) {
  const trimmed = String(raw ?? "").trim();

  if (!trimmed) {
    return null;
  }

  if (
    FORBIDDEN_ORIGIN_LITERALS.has(trimmed) ||
    FORBIDDEN_ORIGIN_LITERALS.has(trimmed.toLowerCase())
  ) {
    throw new Error(`Invalid CLIENT_URL origin: "${trimmed}"`);
  }

  let parsed;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid CLIENT_URL entry: "${trimmed}"`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `CLIENT_URL entries must use http or https: "${trimmed}"`
    );
  }

  if (parsed.search) {
    throw new Error(
      `CLIENT_URL entries must not include a query string: "${trimmed}"`
    );
  }

  if (parsed.hash) {
    throw new Error(
      `CLIENT_URL entries must not include a hash: "${trimmed}"`
    );
  }

  const pathOnlyRoot =
    parsed.pathname === "" || parsed.pathname === "/";

  if (!pathOnlyRoot) {
    throw new Error(
      `CLIENT_URL entries must not include a path: "${trimmed}"`
    );
  }

  const origin = parsed.origin;

  if (
    FORBIDDEN_ORIGIN_LITERALS.has(origin) ||
    FORBIDDEN_ORIGIN_LITERALS.has(origin.toLowerCase())
  ) {
    throw new Error(`Invalid CLIENT_URL origin: "${trimmed}"`);
  }

  return origin;
}

export function parseClientUrlOrigins(rawClientUrl) {
  const parts = String(rawClientUrl ?? "")
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const origins = [];
  const seen = new Set();

  for (const part of parts) {
    const origin = normalizeOriginEntry(part);

    if (origin && !seen.has(origin)) {
      seen.add(origin);
      origins.push(origin);
    }
  }

  return origins;
}

export function resolveAllowedOrigins(rawClientUrl, nodeEnv) {
  const envName = String(nodeEnv || "development").toLowerCase();
  let origins = parseClientUrlOrigins(rawClientUrl);

  if (origins.length === 0) {
    if (envName === "production") {
      throw new Error(
        "CLIENT_URL must list at least one allowed origin in production."
      );
    }

    if (envName === "development" || envName === "test") {
      origins = [...DEFAULT_DEV_ORIGINS];
    }
  }

  return origins;
}
