import { useState } from 'react'
import { Check } from 'lucide-react'
import { contactContent } from '@data/site/contact'

const initialForm = {
  projectType: '',
  companyName: '',
  email: '',
  description: '',
}

const fieldClass =
  'w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-xs text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:border-digi-red/70 focus:shadow-[0_0_0_3px_rgba(208,16,31,0.15)]'

const labelClass = 'mb-2 block text-[13px] text-white/50'

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (
      !form.projectType ||
      !form.companyName ||
      !form.email ||
      !form.description
    ) {
      setError('Please complete all fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email.')
      return
    }

    setError('')
    setSubmitted(true)
    setForm(initialForm)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center sm:p-8">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Check size={21} />
          </div>

          <h3 className="mt-5 text-lg font-medium text-white">
            Inquiry submitted
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-white/50 sm:text-sm">
            Thank you for reaching out. Your project information has been
            captured locally for this frontend experience.
          </p>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-5 text-xs font-medium text-digi-red transition-colors hover:text-white"
          >
            Send another inquiry
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-xl bg-[#0d0d0d] p-4 sm:p-5 lg:px-6 lg:py-7">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Project Type</label>

              <select
                value={form.projectType}
                onChange={(e) => update('projectType', e.target.value)}
                className={`${fieldClass} appearance-none ${
                  form.projectType ? 'text-white' : 'text-white/60'
                }`}
              >
                <option value="" disabled>
                  {contactContent.projectTypePlaceholder}
                </option>

                {contactContent.projectTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Company Name</label>

              <input
                type="text"
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                placeholder="your company name"
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="name@gmail.com"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col rounded-xl border border-white/15 bg-black p-4 sm:min-h-[300px] sm:p-5">
          <label className="mb-3 mt-1 block px-1 text-[13px] text-white/50">
            Project Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={contactContent.descriptionPlaceholder}
            rows={5}
            className="min-h-[130px] flex-1 resize-none rounded-lg bg-[#0d0d0d] p-4 text-xs leading-relaxed text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:shadow-[0_0_0_1px_rgba(208,16,31,0.6)]"
          />

          {error && (
            <p className="mt-3 px-1 text-xs leading-5 text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-digi-red py-3 text-xs font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-125 hover:shadow-[0_12px_30px_-10px_rgba(208,16,31,0.7)] active:translate-y-0"
          >
            Send Inquiry
          </button>
        </div>
      </div>
    </form>
  )
}