import crypto from "node:crypto";

import ContactMessage from "../../models/ContactMessage.js";
import NewsletterSubscriber from "../../models/NewsletterSubscriber.js";
import { env } from "../../config/env.js";
import { sanitizePlainText } from "./sanitizePlainText.js";
import {
  GENERIC_CONTACT_RESPONSE,
  GENERIC_NEWSLETTER_SUBSCRIBE_RESPONSE,
  GENERIC_NEWSLETTER_UNSUBSCRIBE_RESPONSE,
} from "./public.validation.js";

function hashUnsubscribeToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateUnsubscribeToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendContactNotification(doc) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const notifyTo = String(env.CONTACT_NOTIFY_EMAIL || "").trim();

  if (!apiKey || !from || !notifyTo) {
    console.error("Contact notification email is not configured.");
    return;
  }

  const name = sanitizePlainText(doc.name);
  const email = sanitizePlainText(doc.email);
  const company = sanitizePlainText(doc.company || "");
  const projectType = sanitizePlainText(doc.projectType);
  const message = sanitizePlainText(doc.message);

  const text = [
    "New website contact form submission",
    "",
    `Message ID: ${doc._id}`,
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    `Project type: ${projectType}`,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        subject: "New DigiAmplify contact inquiry",
        text,
      }),
    });

    if (!response.ok) {
      console.error(
        "Contact notification email failed:",
        response.status,
        response.statusText,
        "messageId:",
        String(doc._id)
      );
    }
  } catch (error) {
    console.error(
      "Contact notification email failed:",
      error?.message || "network error",
      "messageId:",
      String(doc._id)
    );
  }
}

async function sendNewsletterWelcomeEmail(
  subscriberEmail,
  rawUnsubscribeToken
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const marketingUrl = String(env.MARKETING_URL || "").trim();

  if (!apiKey || !from || !marketingUrl) {
    console.error("Newsletter welcome email is not configured.");
    return;
  }

  const unsubscribeUrl = `${marketingUrl.replace(/\/$/, "")}/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubscribeToken)}`;

  const text =
    "Thanks for subscribing to DigiAmplify updates.\n\n" +
    `Unsubscribe at any time: ${unsubscribeUrl}\n`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [subscriberEmail],
        subject: "Welcome to DigiAmplify updates",
        text,
      }),
    });

    if (!response.ok) {
      console.error(
        "Newsletter welcome email failed:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error(
      "Newsletter welcome email failed:",
      error?.message || "network error"
    );
  }
}

export async function submitContact(body) {
  if (String(body.website ?? "").trim()) {
    return { message: GENERIC_CONTACT_RESPONSE };
  }

  const doc = await ContactMessage.create({
    name: sanitizePlainText(body.name),
    email: String(body.email).trim().toLowerCase(),
    company: sanitizePlainText(body.company || ""),
    projectType: sanitizePlainText(body.projectType),
    message: sanitizePlainText(body.message),
  });

  console.info(`Contact message stored: ${doc._id}`);

  void sendContactNotification(doc);

  return { message: GENERIC_CONTACT_RESPONSE };
}

export async function subscribeNewsletter(body) {
  const email = String(body.email).trim().toLowerCase();

  const existing = await NewsletterSubscriber.findOne({ email }).select(
    "+unsubscribeTokenHash"
  );

  if (existing) {
    if (existing.unsubscribedAt) {
      existing.unsubscribedAt = null;
      existing.subscribedAt = new Date();
      await existing.save();
    }

    return { message: GENERIC_NEWSLETTER_SUBSCRIBE_RESPONSE };
  }

  const rawToken = generateUnsubscribeToken();

  await NewsletterSubscriber.create({
    email,
    unsubscribeTokenHash: hashUnsubscribeToken(rawToken),
    subscribedAt: new Date(),
    unsubscribedAt: null,
  });

  void sendNewsletterWelcomeEmail(email, rawToken);

  return { message: GENERIC_NEWSLETTER_SUBSCRIBE_RESPONSE };
}

export async function unsubscribeNewsletter(token) {
  const tokenHash = hashUnsubscribeToken(token);

  await NewsletterSubscriber.findOneAndUpdate(
    {
      unsubscribeTokenHash: tokenHash,
      unsubscribedAt: null,
    },
    { $set: { unsubscribedAt: new Date() } }
  );

  return { message: GENERIC_NEWSLETTER_UNSUBSCRIBE_RESPONSE };
}

export { hashUnsubscribeToken, generateUnsubscribeToken };
