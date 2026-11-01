import { useCallback, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
  })

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type })

    window.setTimeout(() => {
      setToast({ message: '', type })
    }, duration)
  }, [])

  const hideToast = useCallback(() => {
    setToast((current) => ({ ...current, message: '' }))
  }, [])

  return {
    toast,
    showToast,
    hideToast,
  }
}