import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { blogPosts, postTabs, POSTS_PER_PAGE } from '@/data/blog/post'

// Sab animations ka common easing curve
const ease = [0.16, 1, 0.3, 1]

/* ------------------------------------------------------------------ */
/* Single blog post card                                               */
/* ------------------------------------------------------------------ */
function PostCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease }}
      className="group"
    >
      {/* Post image + neeche wali blurred info bar */}
      <div className="relative aspect-[230/162] w-full overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />

        {/* Info bar: author, date (left) aur category (right) */}
        <div className="absolute inset-x-0 bottom-0 flex h-[36%] items-center justify-between bg-gradient-to-b from-white/5 to-black/20 px-[4%] pt-3 backdrop-blur-md">
          <div className="font-['Poppins']">
            {/* Author name */}
            <p className="text-[13px] font-semibold leading-tight text-white sm:text-[14px]">
              {post.author}
            </p>

            {/* Post date */}
            <p className="mt-1 text-[11px] leading-tight text-white/85 sm:text-[12px]">
              {post.date}
            </p>
          </div>

          {/* Category */}
          <span className="font-['Poppins'] text-[12px] font-medium text-white sm:text-[13px]">
            {post.category}
          </span>
        </div>
      </div>

      {/* Card ka text content */}
      <div className="px-[1.5%] pt-5">
        {/* Title */}
        <h3 className="font-['Poppins'] text-[14px] font-semibold text-white sm:text-[15px]">
          {post.title}
        </h3>

        {/* Short description */}
        <p className="mt-3 font-['Poppins'] text-[12px] leading-[1.65] text-white/45 sm:text-[12.5px]">
          {post.description}
        </p>

        {/* Read Post link */}
        <a
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 font-['Poppins'] text-[12px] text-white transition-colors duration-300 hover:text-[#d50818]"
        >
          Read Post
          <ArrowUpRight
            className="h-[13px] w-[13px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.8}
          />
        </a>
      </div>
    </motion.article>
  )
}

/* ------------------------------------------------------------------ */
/* Pagination button (number ya arrow)                                 */
/* ------------------------------------------------------------------ */
function PageButton({ children, active, disabled, onClick, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`flex h-7 w-7 items-center justify-center rounded-[3px] border font-['Poppins'] text-[12px] font-medium transition-colors duration-300 sm:h-8 sm:w-8 sm:text-[13px] ${
        active
          ? 'border-[#a80008] bg-[#a80008] text-white'
          : 'border-white/50 bg-transparent text-white hover:border-[#d50818] hover:text-[#d50818]'
      } ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
    >
      {children}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */
function BlogPost() {
  // Active tab aur current page ki state
  const [activeTab, setActiveTab] = useState(postTabs[0])
  const [page, setPage] = useState(1)

  // Active tab ke hisaab se posts filter karna
  const filtered = useMemo(
    () =>
      activeTab === 'View All'
        ? blogPosts
        : blogPosts.filter((post) => post.category === activeTab),
    [activeTab]
  )

  // Total pages aur current page ke visible posts
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE))

  const visible = filtered.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  )

  // Tab badalne par page 1 par wapis jana
  const changeTab = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  // Valid page par hi jana
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  return (
    /*
      Section ko thora sa upar lane ke liye negative margin:
      - mobile:  -mt-2
      - tablet:  sm:-mt-4
      - desktop: lg:-mt-[clamp(12px,1.6vw,32px)]
      Aur upar karna ho to in values ko thora barhayein.
    */
    <section className="relative z-20 -mt-2 overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#1a1a1a_0%,#0f0f0f_50%,#060606_100%)] px-5 pb-16 pt-6 text-white sm:-mt-4 sm:px-8 sm:pb-20 sm:pt-7 md:px-10 lg:-mt-[clamp(12px,1.6vw,32px)] lg:px-[5.2%] lg:pb-[clamp(60px,5vw,96px)] lg:pt-[clamp(16px,1.8vw,32px)]">
      <div className="mx-auto max-w-[1920px]">
        {/* ---------------- Category tabs ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="border-b border-white/10"
        >
          <div
            role="tablist"
            className="-mb-px flex gap-7 overflow-x-auto [scrollbar-width:none] sm:gap-10 lg:gap-[clamp(36px,3.5vw,60px)] [&::-webkit-scrollbar]:hidden"
          >
            {postTabs.map((tab) => {
              const isActive = tab === activeTab

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => changeTab(tab)}
                  className={`relative shrink-0 whitespace-nowrap px-1 pb-4 font-['Poppins'] text-[15px] transition-colors duration-300 sm:text-[16px] lg:text-[clamp(14px,1vw,17px)] ${
                    isActive
                      ? 'font-medium text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab}

                  {/* Active tab ki sliding underline */}
                  {isActive && (
                    <motion.span
                      layoutId="blog-tab-underline"
                      transition={{ duration: 0.4, ease }}
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-white"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* ---------------- Posts grid ---------------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-10 grid grid-cols-1 gap-x-[2.2%] gap-y-12 sm:mt-14 sm:grid-cols-2 lg:mt-[clamp(40px,4.4vw,84px)] lg:grid-cols-3 lg:gap-y-[clamp(48px,5vw,96px)]"
          >
            {visible.length > 0 ? (
              visible.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))
            ) : (
              // Agar category mein koi post na ho
              <p className="col-span-full py-20 text-center font-['Poppins'] text-[14px] text-white/50">
                No posts found in this category yet.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ---------------- Pagination ---------------- */}
        <motion.nav
          aria-label="Pagination"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="mt-14 flex items-center justify-center gap-2 sm:mt-16 lg:mt-[clamp(48px,4.5vw,84px)]"
        >
          {/* Previous */}
          <PageButton
            label="Previous page"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          </PageButton>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PageButton
              key={p}
              label={`Page ${p}`}
              active={p === page}
              onClick={() => goToPage(p)}
            >
              {p}
            </PageButton>
          ))}

          {/* Next */}
          <PageButton
            label="Next page"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          </PageButton>
        </motion.nav>
      </div>
    </section>
  )
}

export default BlogPost