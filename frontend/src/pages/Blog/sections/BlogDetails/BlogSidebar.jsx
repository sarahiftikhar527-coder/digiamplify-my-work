import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { blogSidebar } from '@/data/blog/details'

const ease = [0.16, 1, 0.3, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, delay, ease },
})

const MIN_CHARS = 2
const MAX_SUGGESTIONS = 8

// In jagahon ka text search mein shamil nahi hoga
const SKIP_SELECTOR =
  'aside, form, script, style, textarea, input, button, [aria-hidden="true"]'

/* ----------------------- Search + highlight helpers ----------------------- */
const canHighlight = () =>
  typeof CSS !== 'undefined' &&
  'highlights' in CSS &&
  typeof window.Highlight !== 'undefined'

const clearHighlights = () => {
  if (!canHighlight()) return
  CSS.highlights.delete('search-all')
  CSS.highlights.delete('search-hit')
}

const makeRange = (hit) => {
  const range = document.createRange()
  range.setStart(hit.node, hit.start)
  range.setEnd(hit.node, hit.end)
  return range
}

// Purane browsers ke liye: us block ko thori der ke liye highlight karo
const flash = (el) => {
  if (!el) return
  el.style.transition = 'background-color 0.4s'
  el.style.backgroundColor = 'rgba(213, 8, 24, 0.35)'
  setTimeout(() => {
    el.style.backgroundColor = ''
  }, 2500)
}

// Page ke article text (main) mein query dhoondo
const findMatches = (query) => {
  const root = document.querySelector('main') ?? document.body
  const needle = query.toLowerCase()

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
      if (node.parentElement?.closest(SKIP_SELECTOR)) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const matches = []

  while (walker.nextNode()) {
    const node = walker.currentNode
    const text = node.nodeValue
    const lower = text.toLowerCase()

    let idx = lower.indexOf(needle)
    while (idx !== -1) {
      const end = idx + needle.length

      matches.push({
        node,
        start: idx,
        end,
        before:
          (idx > 28 ? '…' : '') +
          text.slice(Math.max(0, idx - 28), idx).replace(/\s+/g, ' '),
        match: text.slice(idx, end),
        after:
          text.slice(end, end + 40).replace(/\s+/g, ' ') +
          (end + 40 < text.length ? '…' : ''),
      })

      idx = lower.indexOf(needle, end)
    }
  }

  return matches
}

// Section titles (Categories, Recent Post, Tags)
function SidebarTitle({ children }) {
  return <p className="mb-4 text-[14px] text-white/60">{children}</p>
}

function BlogSidebar({
  recent = blogSidebar.recent,
  onSearch,
  onCategoryChange,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [activeCategory, setActiveCategory] = useState(
    blogSidebar.categories[0].label
  )
  const boxRef = useRef(null)

  const visible = results.slice(0, MAX_SUGGESTIONS)

  // Bahar click karne par suggestions band, unmount par highlight saaf
  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)

    return () => {
      document.removeEventListener('mousedown', onDown)
      clearHighlights()
    }
  }, [])

  const runSearch = (value) => {
    const q = value.trim()

    if (q.length < MIN_CHARS) {
      setResults([])
      setActive(-1)
      return []
    }

    const found = findMatches(q)
    setResults(found)
    setActive(-1)
    return found
  }

  // Type karte hi suggestions aayen (Google ki tarah)
  const handleInput = (e) => {
    const value = e.target.value
    setQuery(value)
    clearHighlights()
    runSearch(value)
    setOpen(value.trim().length >= MIN_CHARS)
  }

  const reopen = () => {
    if (query.trim().length >= MIN_CHARS) {
      runSearch(query)
      setOpen(true)
    }
  }

  // Suggestion par click: wahan scroll + highlight
  const goTo = (list, index) => {
    const hit = list[index]
    if (!hit) return

    const range = makeRange(hit)

    if (canHighlight()) {
      const all = new window.Highlight(...list.map(makeRange))
      const current = new window.Highlight(range)
      current.priority = 1
      CSS.highlights.set('search-all', all)
      CSS.highlights.set('search-hit', current)
    } else {
      flash(hit.node.parentElement)
    }

    const rect = range.getBoundingClientRect()
    window.scrollTo({
      top: rect.top + window.scrollY - window.innerHeight / 3,
      behavior: 'smooth',
    })

    setActive(index)
    setOpen(false)
    onSearch?.(query.trim())
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const value = query.trim()
    if (value.length < MIN_CHARS) return

    const list = results.length ? results : runSearch(value)
    goTo(list, active >= 0 ? active : 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      clearHighlights()
      return
    }

    if (!open || !visible.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % visible.length)
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? visible.length - 1 : a - 1))
    }
  }

  const handleCategory = (label) => {
    setActiveCategory(label)
    onCategoryChange?.(label)
  }

  return (
    <div className="space-y-10">
      {/* Search */}
      <div ref={boxRef} className="relative">
        {/* Highlight ka style */}
        <style>{`
          ::highlight(search-all) {
            background-color: rgba(213, 8, 24, 0.45);
            color: #fff;
          }
          ::highlight(search-hit) {
            background-color: #d50818;
            color: #fff;
          }
        `}</style>

        <motion.form
          onSubmit={handleSearch}
          {...fadeUp(0)}
          className="flex items-center gap-2.5 rounded-md border border-white/15 bg-white/[0.03] py-2 pl-3.5 pr-2 transition-colors duration-300 focus-within:border-[#d50818]"
        >
          <Search
            className="h-4 w-4 shrink-0 text-white/60"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={reopen}
            onClick={reopen}
            onKeyDown={handleKeyDown}
            placeholder={blogSidebar.searchPlaceholder}
            aria-label="Search"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/50"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] bg-[#c4000f] text-white transition-colors duration-300 hover:bg-[#ff1a2e]"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </motion.form>

        {/* Suggestions */}
        {open && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-md border border-white/15 bg-[#0c0c0c] shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
          >
            {visible.length ? (
              <>
                <p className="border-b border-white/10 px-3.5 py-2 text-[10.5px] text-white/45">
                  {results.length} {results.length === 1 ? 'match' : 'matches'}{' '}
                  on this page
                </p>

                <ul className="max-h-[260px] overflow-y-auto">
                  {visible.map((hit, i) => (
                    <li key={`${i}-${hit.start}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goTo(results, i)}
                        className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-[12px] leading-snug text-white/75 transition-colors duration-200 ${
                          i === active
                            ? 'bg-white/[0.07]'
                            : 'hover:bg-white/[0.05]'
                        }`}
                      >
                        <Search
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40"
                          strokeWidth={1.8}
                        />
                        <span className="min-w-0 break-words">
                          {hit.before}
                          <span className="font-semibold text-[#ff4d5e]">
                            {hit.match}
                          </span>
                          {hit.after}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="px-3.5 py-3 text-[12px] text-white/55">
                No results for “{query.trim()}”
              </p>
            )}
          </div>
        )}
      </div>

      {/* Categories */}
      <motion.div {...fadeUp(0.05)}>
        <SidebarTitle>Categories</SidebarTitle>

        <ul>
          {blogSidebar.categories.map((cat) => {
            const isActive = cat.label === activeCategory

            return (
              <li key={cat.label} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => handleCategory(cat.label)}
                  className={`flex w-full items-center justify-between py-3 text-left text-[13px] font-medium transition-colors duration-300 hover:text-[#d50818] ${
                    isActive ? 'text-[#d50818]' : 'text-white'
                  }`}
                >
                  {cat.label}

                  <span
                    className={`min-w-[34px] rounded-[3px] px-2 py-0.5 text-center text-[11.5px] font-semibold ${
                      isActive
                        ? 'bg-[#d50818] text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </motion.div>

      {/* Recent posts */}
      <motion.div {...fadeUp(0.1)}>
        <SidebarTitle>Recent Post</SidebarTitle>

        <div className="space-y-2.5">
          {recent.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex items-stretch gap-2.5"
            >
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                draggable={false}
                className="h-[58px] w-[60px] shrink-0 rounded-[3px] object-cover"
              />

              <div className="min-w-0 flex-1 rounded-[3px] border border-white/10 bg-white/[0.02] px-3 py-2 transition-colors duration-300 group-hover:border-[#d50818]/60">
                <p className="line-clamp-2 text-[11.5px] font-semibold leading-snug text-white">
                  {post.title}
                </p>
                <p className="mt-1.5 text-[10px] text-white/40">{post.date}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Tags */}
      <motion.div {...fadeUp(0.15)}>
        <SidebarTitle>Tags</SidebarTitle>

        <div className="flex flex-wrap gap-2.5">
          {blogSidebar.tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="cursor-pointer rounded-[3px] border border-white/20 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] text-white transition-colors duration-300 hover:border-[#d50818] hover:text-[#d50818]"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* CTA box */}
      <motion.div
        {...fadeUp(0.2)}
        className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
      >
        <p className="text-[15px] font-medium text-white">
          {blogSidebar.cta.title}
        </p>
        <p className="mt-3 text-[12.5px] text-white/60">
          {blogSidebar.cta.text}
        </p>

        <motion.a
          href={blogSidebar.cta.href}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex h-10 w-full items-center justify-center rounded-[4px] bg-[#c4000f] text-[12.5px] font-semibold text-white transition-colors duration-300 hover:bg-[#ff1a2e]"
        >
          {blogSidebar.cta.button}
        </motion.a>
      </motion.div>
    </div>
  )
}

export default BlogSidebar