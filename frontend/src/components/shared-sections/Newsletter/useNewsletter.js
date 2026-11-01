import { useState } from 'react'

export function useNewsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const submit = () => {
    if (!email.trim()) {
      setError('Please enter your email.')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.')
      return false
    }

    setError('')
    setSubmitted(true)
    return true
  }

  return { email, setEmail, submitted, error, submit }
}