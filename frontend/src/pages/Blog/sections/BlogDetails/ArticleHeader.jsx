import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye, MessageSquare, Share } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1]

function ArticleHeader({ article }) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Share: mobile par native share, warna link copy
  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // user ne share cancel kar diya
    }
  }

  return (
    <header>
      <div className="relative">
        {/* Rotating 3D image (top right) */}
        <motion.img
          src={article.ringImage}
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            opacity: { duration: 1, ease },
            scale: { duration: 1.2, ease },
            rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
          }}
          className="pointer-events-none absolute right-0 top-0 z-0 w-[78px] select-none object-contain sm:w-[110px] lg:w-[clamp(100px,9.5vw,175px)]"
        />

        {/* Meta row: category pill, read time, date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10.5px] text-white/60"
        >
          <span className="rounded-full bg-[#d50818] px-4 py-1.5 text-[11px] font-medium text-white">
            {article.category}
          </span>

          <span className="h-px w-6 bg-white/30 sm:w-10" />
          <span>{article.readTime}</span>
          <span className="h-px w-6 bg-white/30 sm:w-10" />
          <span>{article.date}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="relative z-10 mt-6 max-w-[78%] text-[24px] font-normal leading-[1.25] sm:max-w-[68%] sm:text-[30px] lg:max-w-[64%] lg:text-[clamp(28px,2.4vw,44px)]"
        >
          {article.title}
        </motion.h1>

        {/* Excerpt */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease }}
          className="relative z-10 mt-5 max-w-[560px] text-[12px] leading-[1.7] text-white/50 sm:text-[12.5px] lg:max-w-[62%] lg:text-[clamp(11.5px,0.82vw,14px)]"
        >
          {article.excerpt}
        </motion.p>
      </div>

      {/* Author bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease }}
        className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4"
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          {article.author.avatar ? (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="h-11 w-11 rounded-full object-cover lg:h-[clamp(40px,3.2vw,56px)] lg:w-[clamp(40px,3.2vw,56px)]"
            />
          ) : (
            <span className="h-11 w-11 rounded-full bg-[#d9d9d9] lg:h-[clamp(40px,3.2vw,56px)] lg:w-[clamp(40px,3.2vw,56px)]" />
          )}

          <div>
            <p className="text-[12px] font-semibold leading-tight">
              {article.author.name}
            </p>
            <p className="mt-1 text-[10px] text-white/70">
              {article.author.role}
            </p>
          </div>
        </div>

        <span className="hidden h-9 w-px bg-white/15 sm:block" />

        {/* Views + comments */}
        <div className="flex items-center gap-4 text-[10.5px] text-white/60">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-[#d50818]" strokeWidth={1.6} />
            {article.views}
          </span>

          <span className="flex items-center gap-1.5">
            <MessageSquare
              className="h-3.5 w-3.5 text-[#d50818]"
              strokeWidth={1.6}
            />
            {article.commentsLabel}
          </span>
        </div>

        {/* Save / Share */}
        <div className="flex gap-2 sm:ml-auto">
          <motion.button
            type="button"
            onClick={() => setSaved((s) => !s)}
            aria-pressed={saved}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-[10px] transition-colors duration-300 ${
              saved
                ? 'border-[#d50818] text-[#d50818]'
                : 'border-white/15 text-white hover:border-[#d50818] hover:text-[#d50818]'
            }`}
          >
            <Download className="h-3 w-3" strokeWidth={1.8} />
            {saved ? 'Saved' : 'Save'}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleShare}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-[4px] border border-white/15 px-3 py-1.5 text-[10px] text-white transition-colors duration-300 hover:border-[#d50818] hover:text-[#d50818]"
          >
            <Share className="h-3 w-3" strokeWidth={1.8} />
            {copied ? 'Copied' : 'Share'}
          </motion.button>
        </div>
      </motion.div>

      {/* Cover image */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease }}
        className="mt-6 aspect-[478/244] w-full overflow-hidden rounded-xl border border-white/10"
      >
        <img
          src={article.coverImage}
          alt={article.title}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </motion.div>
    </header>
  )
}

export default ArticleHeader