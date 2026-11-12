import { env } from '../config/env.js'

// Sends one email through Resend. Never throws.
export async function sendEmail({ to, subject, text, html }) {
  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY
  const from = env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    console.error('Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    })

    if (!response.ok) {
      console.error('Email send failed:', response.status, response.statusText)
      return false
    }
    return true
  } catch (error) {
    console.error('Email send failed:', error?.message || 'network error')
    return false
  }
}