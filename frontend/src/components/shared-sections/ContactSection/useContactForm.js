import { useState } from 'react'

const initialState = {
  projectType: '',
  companyName: '',
  email: '',
  description: '',
}

export function useContactForm() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const validate = () => {
    const nextErrors = {}

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        nextErrors[key] = 'This field is required.'
      }
    })

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      nextErrors.email = 'Enter a valid email.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const reset = () => {
    setForm(initialState)
    setErrors({})
  }

  return {
    form,
    errors,
    updateField,
    validate,
    reset,
  }
}