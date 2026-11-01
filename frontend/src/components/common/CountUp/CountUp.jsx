import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

function CountUp({ value, duration = 1.5, suffix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  const numericValue = Number(value)

  useEffect(() => {
    if (!isInView) return

    let startTime
    let frame

    const animate = (time) => {
      if (!startTime) startTime = time

      const progress = Math.min(
        (time - startTime) / (duration * 1000),
        1
      )

      setCount(Math.floor(progress * numericValue))

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [duration, isInView, numericValue])

  return (
    <motion.span ref={ref}>
      {count}
      {suffix}
    </motion.span>
  )
}

export default CountUp