import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blogHero } from '@/data/blog/hero'
import { blogPosts } from '@/data/blog/post'

const ease = [0.16, 1, 0.3, 1]
const MAX_SUGGESTIONS = 6

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Matched word ko red + bold karo
function Highlight({ text, query }) {
  const q = query.trim()
  if (!q) return text

  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'ig'))

  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <span key={i} className="font-semibold text-[#ff4d5e]">
        {part}
      </span>
    ) : (
      part
    )
  )
}

// Description mein jahan word mila, uske aas paas ka text
const snippet = (text, q) => {
  const idx = text.toLowerCase().indexOf(q)
  const start = Math.max(0, idx - 24)
  const end = Math.min(text.length, idx + q.length + 36)

  return (
    (start > 0 ? '…' : '') +
    text.slice(start, end) +
    (end < text.length ? '…' : '')
  )
}

// Ek post ka best match: title > category > tag > description
const getMatch = (post, q) => {
  const has = (t) => typeof t === 'string' && t.toLowerCase().includes(q)

  if (has(post.title)) {
    return {
      score: post.title.toLowerCase().startsWith(q) ? 0 : 1,
      label: 'Title',
      detail: post.category,
    }
  }

  if (has(post.category)) {
    return { score: 2, label: 'Category', detail: post.category }
  }

  const tag = Array.isArray(post.tags) ? post.tags.find(has) : null
  if (tag) {
    return { score: 3, label: 'Tag', detail: tag }
  }

  const body = post.excerpt || post.description
  if (has(body)) {
    return { score: 4, label: 'Article', detail: snippet(body, q) }
  }

  return null
}

function BlogHero({ onSearch }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef(null)

  // Sirf blog posts mein search (title, category, tags, description)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return blogPosts
      .map((post) => {
        const match = getMatch(post, q)
        return match ? { post, ...match } : null
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_SUGGESTIONS)
  }, [query])

  // Bahar click karne par suggestions band
  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current?.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Suggestion par click: us blog ke page par jao
  const goToPost = (post) => {
    setShowSuggestions(false)
    setQuery(post.title)
    navigate(`/blog/${post.slug}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const value = query.trim()
    if (!value) return

    // Arrow keys se koi suggestion chuni ho to us blog par jao
    if (active >= 0 && suggestions[active]) {
      goToPost(suggestions[active].post)
      return
    }

    onSearch?.(value)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActive(-1)
      return
    }

    if (!showSuggestions || !suggestions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % suggestions.length)
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1))
    }
  }

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_100%,#1b1b1b_0%,#101010_45%,#050505_100%)] text-white">
      <div className="relative mx-auto flex min-h-[570px] max-w-[1920px] flex-col px-5 pb-2 pt-14 sm:px-8 sm:pt-16 md:px-10 lg:min-h-[clamp(580px,45vw,850px)] lg:px-[7%] lg:pb-0 lg:pt-[clamp(70px,7vw,130px)]">

        <div className="relative z-20 lg:max-w-[48%]">
          <motion.h1
            initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
            className="text-[56px] font-normal leading-[1] tracking-[-0.03em] sm:text-[80px] md:text-[96px] lg:text-[clamp(72px,6.3vw,120px)]"
          >
            {blogHero.title}{' '}
            <motion.span
              initial={{ opacity: 0, x: 35, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease }}
              className="inline-block text-[#d50818]"
            >
              {blogHero.highlightedTitle}
            </motion.span>
          </motion.h1>

          <div
            ref={boxRef}
            className="relative mt-6 w-full max-w-[310px] sm:mt-8 lg:mt-[clamp(28px,3.2vw,52px)]"
          >
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease }}
              className="relative z-30 flex w-full items-center overflow-visible rounded-full border border-white/60 bg-transparent transition-colors duration-300 focus-within:border-[#d50818]"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(-1)
                  setShowSuggestions(true)
                }}
                onFocus={() => {
                  if (query.trim()) setShowSuggestions(true)
                }}
                onKeyDown={handleKeyDown}
                placeholder={blogHero.searchPlaceholder}
                aria-label="Search blog"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-autocomplete="list"
                autoComplete="off"
                className="h-[34px] min-w-0 flex-1 rounded-l-full bg-transparent px-4 font-['Poppins'] text-[12px] text-white outline-none placeholder:text-white/45 sm:h-[36px] sm:px-5"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="h-[34px] shrink-0 rounded-full bg-[#a80008] px-5 font-['Poppins'] text-[12px] font-medium text-white transition-colors duration-300 hover:bg-[#d50818] sm:h-[36px] sm:px-6"
              >
                {blogHero.searchButton}
              </motion.button>
            </motion.form>

            {showSuggestions && query.trim() && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                {suggestions.map((item, index) => (
                  <button
                    key={item.post.id}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => goToPost(item.post)}
                    className={`group flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left transition-colors duration-200 last:border-b-0 ${
                      index === active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d50818]/10 text-[#d50818]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-['Poppins'] text-[12px] text-white transition-colors group-hover:text-[#d50818]">
                        <Highlight text={item.post.title} query={query} />
                      </span>

                      <span className="mt-0.5 block truncate text-[9.5px] text-white/40">
                        <span className="mr-1.5 uppercase tracking-[0.12em] text-[#d50818]/80">
                          {item.label}
                        </span>
                        <Highlight text={item.detail} query={query} />
                      </span>
                    </span>

                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-[#d50818]"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </motion.div>
            )}

            {showSuggestions && query.trim() && suggestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-white/10 bg-[#111111]/95 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                <p className="font-['Poppins'] text-[12px] text-white/45">
                  No matching blog content found.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.5, ease }}
          className="relative z-20 mt-8 max-w-[520px] text-[13px] leading-[1.7] text-white/55 sm:text-[14px] lg:absolute lg:right-[7%] lg:top-[clamp(70px,7vw,130px)] lg:mt-0 lg:max-w-[clamp(340px,28vw,520px)] lg:text-[clamp(11px,0.82vw,14px)] lg:leading-[1.6]"
        >
          {blogHero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease }}
          className="pointer-events-none relative z-10 mx-auto mt-2 aspect-square w-[58%] max-w-[280px] sm:mt-2 sm:max-w-[330px] lg:absolute lg:bottom-[14%] lg:right-[7%] lg:mx-0 lg:mt-0 lg:w-[clamp(200px,18vw,500px)] lg:max-w-none"
        >
          <div className="absolute inset-[15%] rounded-full bg-[#d50818]/20 blur-[70px]" />

          <motion.img
            src={blogHero.image}
            alt="Rotating 3D ring"
            draggable={false}
            animate={{ rotate: 360 }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="relative h-full w-full select-none object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.12)]"
          />
        </motion.div>
      </div>
    </section>
  )
}

export default BlogHero