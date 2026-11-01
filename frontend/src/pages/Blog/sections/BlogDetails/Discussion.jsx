import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Flag, Heart, Share } from 'lucide-react'
import { blogComments } from '@/data/blog/details'

const ease = [0.16, 1, 0.3, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.8, delay, ease },
})

/* ------------------------- Single comment ------------------------- */
function CommentItem({ comment, onReply }) {
  const [liked, setLiked] = useState(false)
  const [reported, setReported] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.href}#comment-${comment.id}`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard available nahi
    }
  }

  return (
    <motion.article
      id={`comment-${comment.id}`}
      // whileInView ki jagah animate: naya comment foran display hota hai
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="rounded-md border border-white/10 bg-[#0c0c0c] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {comment.avatar ? (
            <img
              src={comment.avatar}
              alt={comment.name}
              className="h-[38px] w-[38px] rounded-full object-cover"
            />
          ) : (
            <span className="h-[38px] w-[38px] shrink-0 rounded-full bg-[#d9d9d9]" />
          )}

          <div>
            <p className="text-[11.5px] font-semibold leading-tight">
              {comment.name}
            </p>
            <p className="mt-1 text-[9.5px] text-white/55">{comment.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onReply(comment.name)}
          className="shrink-0 rounded-[3px] bg-[#c4000f] px-3 py-1 text-[9px] font-medium text-white transition-colors duration-300 hover:bg-[#ff1a2e]"
        >
          Reply
        </button>
      </div>

      <p className="mt-3 text-[10.5px] leading-[1.65] text-white/75">
        {comment.text}
      </p>

      <div className="mt-3 flex items-center gap-5 border-t border-white/[0.06] pt-3 text-[9.5px] text-white/50">
        <button
          type="button"
          onClick={() => setLiked((l) => !l)}
          aria-pressed={liked}
          className="flex items-center gap-1.5 transition-colors duration-300 hover:text-white"
        >
          <Heart
            className={`h-3 w-3 text-[#d50818] ${
              liked ? 'fill-[#d50818]' : ''
            }`}
            strokeWidth={1.6}
          />
          {comment.likes + (liked ? 1 : 0)}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 transition-colors duration-300 hover:text-white"
        >
          <Share className="h-3 w-3" strokeWidth={1.6} />
          {copied ? 'Copied' : 'Share'}
        </button>

        <button
          type="button"
          onClick={() => setReported(true)}
          disabled={reported}
          className="flex items-center gap-1.5 transition-colors duration-300 hover:text-white disabled:cursor-default disabled:text-[#d50818]"
        >
          <Flag className="h-3 w-3" strokeWidth={1.6} />
          {reported ? 'Reported' : 'Report'}
        </button>
      </div>
    </motion.article>
  )
}

/* ---------------------------- Main block ---------------------------- */
function Discussion() {
  const [comments, setComments] = useState(blogComments)
  const [form, setForm] = useState({ name: '', email: '', comment: '' })
  const [posted, setPosted] = useState(false)
  const textareaRef = useRef(null)
  const commentsRef = useRef(null)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  // Reply dabane par comment box mein @name aa jaye
  const handleReply = (name) => {
    setForm((f) => ({ ...f, comment: `@${name} ` }))
    textareaRef.current?.focus()
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    const newComment = {
      id: Date.now(),
      name: form.name.trim(),
      role: `Guest . ${today}`,
      avatar: '',
      text: form.comment.trim(),
      likes: 0,
    }

    setComments((list) => [newComment, ...list])
    setForm({ name: '', email: '', comment: '' })
    setPosted(true)
    setTimeout(() => setPosted(false), 3000)

    // Naya comment nazar aane ke liye list tak scroll
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 text-[10.5px] text-white outline-none transition-colors duration-300 placeholder:text-white/50 focus:border-[#d50818]"

  return (
    <section className="mt-16">
      {/* Heading */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[16px] font-semibold sm:text-[17px]">Discussion</h2>

        <span className="rounded-full border border-white/20 px-5 py-1.5 text-[10px] text-white">
          {comments.length} Comments
        </span>
      </div>

      {/* Comments */}
      <div ref={commentsRef} className="mt-4 scroll-mt-24 space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReply}
          />
        ))}
      </div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        {...fadeUp()}
        className="mt-9 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 sm:p-6"
      >
        <h3 className="text-[15px] font-semibold">Join the Conversation</h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-[12px] text-white/60">
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className={`${inputClass} h-10`}
            />
          </label>

          <label className="block text-[12px] text-white/60">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@gmail.com"
              required
              className={`${inputClass} h-10`}
            />
          </label>
        </div>

        <label className="mt-4 block text-[12px] text-white/60">
          Comment
          <textarea
            ref={textareaRef}
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Share your thoughts..."
            required
            rows={4}
            className={`${inputClass} resize-none py-3`}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="h-9 w-full rounded-full bg-[#c4000f] px-12 text-[11.5px] font-medium text-white transition-colors duration-300 hover:bg-[#ff1a2e] sm:w-auto"
          >
            Post Comment
          </motion.button>

          {posted && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-[11px] font-medium text-green-400"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Thanks! Your comment has been posted.
            </motion.span>
          )}
        </div>
      </motion.form>
    </section>
  )
}

export default Discussion
