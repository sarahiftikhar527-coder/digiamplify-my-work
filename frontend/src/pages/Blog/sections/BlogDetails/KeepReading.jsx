import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { keepReading } from '@/data/blog/details'

const ease = [0.16, 1, 0.3, 1]

function KeepReading({ posts = keepReading.posts }) {
  return (
    <section className="mt-20">
      {/* Heading row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="flex items-center justify-between gap-4"
      >
        <h2 className="text-[16px] font-semibold sm:text-[17px]">
          {keepReading.title}
        </h2>

        <a
          href={keepReading.linkHref}
          className="group flex items-center gap-2 text-[12px] text-[#d50818] transition-colors duration-300 hover:text-[#ff1a2e] sm:text-[13px]"
        >
          {keepReading.linkLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={1.6}
          />
        </a>
      </motion.div>

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {posts.map((post, i) => (
          <motion.a
            key={post.id}
            href={`/blog/${post.slug}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease }}
            className="group overflow-hidden rounded-lg border border-white/10 bg-[#0f0f0f] transition-colors duration-300 hover:border-[#d50818]/50"
          >
            <div className="aspect-[192/107] w-full overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              />
            </div>

            <div className="p-4">
              <p className="text-[11px] text-[#d50818]">{post.category}</p>

              <h3 className="mt-3 max-w-[200px] text-[12.5px] font-semibold leading-snug text-white">
                {post.title}
              </h3>

              <p className="mt-3 text-[10px] leading-[1.6] text-white/45">
                {post.description}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-[9.5px]">
                <span className="text-white/60">{post.date}</span>

                <span className="flex items-center gap-1 text-[#d50818]">
                  {post.readTime}
                  <ArrowRight
                    className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.8}
                  />
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

export default KeepReading