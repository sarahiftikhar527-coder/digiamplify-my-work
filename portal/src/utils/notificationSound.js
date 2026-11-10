/*
  Plays a short two-note "ding" (like a chat message sound) with the Web Audio
  API, so no audio file is needed.

  Browsers block sound until the user has clicked or pressed a key once on the
  page. We unlock the audio on the first interaction, so later alerts can play.
*/

let audioContext = null
let unlockBound = false

function getContext() {
  if (typeof window === 'undefined') return null

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null

  if (!audioContext) audioContext = new AudioCtx()
  return audioContext
}

export function unlockNotificationSound() {
  if (unlockBound || typeof window === 'undefined') return
  unlockBound = true

  const unlock = () => {
    const ctx = getContext()
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})

    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
    window.removeEventListener('touchstart', unlock)
  }

  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
  window.addEventListener('touchstart', unlock)
}

function playTone(ctx, { frequency, start, duration, volume }) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, start)

  // Quick fade in and a smooth fade out, so it does not click or buzz.
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(start)
  oscillator.stop(start + duration + 0.05)
}

export function playNotificationSound() {
  try {
    const ctx = getContext()
    if (!ctx) return

    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const now = ctx.currentTime
    playTone(ctx, { frequency: 880, start: now, duration: 0.18, volume: 0.22 })
    playTone(ctx, { frequency: 1318.5, start: now + 0.14, duration: 0.32, volume: 0.2 })
  } catch {
    // Sound is a nice-to-have. Never break the page because of it.
  }
}