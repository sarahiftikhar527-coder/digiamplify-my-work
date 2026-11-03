import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import crypto from "node:crypto";

import { sanitizePlainText } from "../src/modules/public/sanitizePlainText.js";
import {
  contactSubmitSchema,
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
  GENERIC_CONTACT_RESPONSE,
  GENERIC_NEWSLETTER_SUBSCRIBE_RESPONSE,
  GENERIC_NEWSLETTER_UNSUBSCRIBE_RESPONSE,
} from "../src/modules/public/public.validation.js";

const contactCreateMock = vi.fn();
const newsletterFindOneMock = vi.fn();
const newsletterCreateMock = vi.fn();
const newsletterFindOneAndUpdateMock = vi.fn();

vi.mock("../src/models/ContactMessage.js", () => ({
  default: {
    create: (...args) => contactCreateMock(...args),
  },
}));

vi.mock("../src/models/NewsletterSubscriber.js", () => ({
  default: {
    findOne: (...args) => newsletterFindOneMock(...args),
    create: (...args) => newsletterCreateMock(...args),
    findOneAndUpdate: (...args) => newsletterFindOneAndUpdateMock(...args),
  },
}));

vi.mock("../src/config/env.js", () => ({
  env: {
    CONTACT_NOTIFY_EMAIL: "notify@example.com",
    MARKETING_URL: "http://localhost:5173",
  },
}));

const {
  submitContact,
  subscribeNewsletter,
  unsubscribeNewsletter,
  hashUnsubscribeToken,
} = await import("../src/modules/public/public.service.js");

describe("sanitizePlainText", () => {
  it("strips HTML tags", () => {
    expect(sanitizePlainText("<b>Hello</b> world")).toBe("Hello world");
  });
});

describe("public.validation", () => {
  it("requires consent and strict contact body", () => {
    const valid = contactSubmitSchema.safeParse({
      body: {
        name: "Ada",
        email: "ada@example.com",
        projectType: "Web",
        message: "Hi",
        consent: true,
      },
    });

    expect(valid.success).toBe(true);

    const honeypotAllowed = contactSubmitSchema.safeParse({
      body: {
        name: "Ada",
        email: "ada@example.com",
        projectType: "Web",
        message: "Hi",
        consent: true,
        website: "",
      },
    });

    expect(honeypotAllowed.success).toBe(true);

    const extra = contactSubmitSchema.safeParse({
      body: {
        name: "Ada",
        email: "ada@example.com",
        projectType: "Web",
        message: "Hi",
        consent: true,
        extra: true,
      },
    });

    expect(extra.success).toBe(false);
  });
});

describe("public.service (mocked models)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "from@example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: "OK" })
    );
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    vi.unstubAllGlobals();
  });

  it("honeypot path stores and sends nothing but returns generic success", async () => {
    const result = await submitContact({
      name: "Bot",
      email: "bot@example.com",
      projectType: "Web",
      message: "spam",
      consent: true,
      website: "http://spam.test",
    });

    expect(result.message).toBe(GENERIC_CONTACT_RESPONSE);
    expect(contactCreateMock).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("stores contact and triggers notification without logging PII in create", async () => {
    const id = "507f1f77bcf86cd799439011";
    contactCreateMock.mockResolvedValue({
      _id: id,
      name: "Ada",
      email: "ada@example.com",
      company: "",
      projectType: "Web",
      message: "Hello",
    });

    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    await submitContact({
      name: "Ada",
      email: "ada@example.com",
      projectType: "Web",
      message: "Hello",
      consent: true,
    });

    expect(contactCreateMock).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(`Contact message stored: ${id}`);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });

  it("stores only SHA-256 hash for newsletter unsubscribe token", async () => {
    const fixedBytes = Buffer.alloc(32, 0xab);
    vi.spyOn(crypto, "randomBytes").mockReturnValue(fixedBytes);

    const rawToken = fixedBytes.toString("hex");

    newsletterFindOneMock.mockReturnValue({
      select: () => Promise.resolve(null),
    });

    newsletterCreateMock.mockImplementation(async (payload) => payload);

    await subscribeNewsletter({ email: "user@example.com", consent: true });

    const createArg = newsletterCreateMock.mock.calls[0][0];

    expect(createArg.unsubscribeTokenHash).toBe(hashUnsubscribeToken(rawToken));
    expect(createArg.unsubscribeTokenHash).not.toBe(rawToken);

    crypto.randomBytes.mockRestore();
  });

  it("returns identical subscribe response for already-subscribed email", async () => {
    newsletterFindOneMock.mockReturnValue({
      select: () =>
        Promise.resolve({
          email: "user@example.com",
          unsubscribedAt: null,
        }),
    });

    const first = await subscribeNewsletter({
      email: "user@example.com",
      consent: true,
    });

    expect(first.message).toBe(GENERIC_NEWSLETTER_SUBSCRIBE_RESPONSE);
    expect(newsletterCreateMock).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns generic unsubscribe response when token does not match", async () => {
    newsletterFindOneAndUpdateMock.mockResolvedValue(null);

    const result = await unsubscribeNewsletter("b".repeat(64));

    expect(result.message).toBe(GENERIC_NEWSLETTER_UNSUBSCRIBE_RESPONSE);
  });
});
