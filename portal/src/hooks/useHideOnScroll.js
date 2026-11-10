import { useEffect, useState } from 'react'

/*
  Returns `hidden` = true while the user scrolls DOWN, and false again as soon
  as they scroll UP even a little (or are near the top).

  Pass a ref to a scrolling element. Pass nothing to watch the window.
*/
export default function useHideOnScroll(scrollRef, { hideAfter = 80, upDelta = 4, downDelta = 6 } = {}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const target = scrollRef?.current || window
    const readTop = () =>
      target === window
        ? window.scrollY || document.documentElement.scrollTop
        : target.scrollTop

    let lastTop = readTop()
    let ticking = false

    const update = () => {
      ticking = false
      const top = Math.max(0, readTop())
      const diff = top - lastTop

      if (top <= 10) {
        setHidden(false)
        lastTop = top
        return
      }

      if (diff > downDelta && top > hideAfter) {
        setHidden(true)
        lastTop = top
      } else if (diff < -upDelta) {
        setHidden(false)
        lastTop = top
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [scrollRef, hideAfter, upDelta, downDelta])

  return hidden
}