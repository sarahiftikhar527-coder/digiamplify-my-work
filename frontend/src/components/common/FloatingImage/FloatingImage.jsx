import { motion, useReducedMotion } from 'framer-motion'

function FloatingImage({
  src,
  alt = '',
  className = '',
  duration = 5,
  delay = 0,
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      animate={
        reducedMotion
          ? {}
          : {
              y: [0, -12, 0],
              rotate: [0, 1.5, 0],
            }
      }
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default FloatingImage