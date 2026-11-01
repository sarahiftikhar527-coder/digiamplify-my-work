import BlogSidebar from './BlogSidebar'
import ArticleHeader from './ArticleHeader'
import ArticleBody from './ArticleBody'
import Discussion from './Discussion'
import KeepReading from './KeepReading'
import { blogArticle } from '@/data/blog/details'

function BlogDetails({ article = blogArticle, related, recent }) {
  return (
    <section className="relative overflow-x-clip bg-[radial-gradient(circle_at_15%_15%,#1a1a1a_0%,#0d0d0d_45%,#000000_100%)] px-5 py-10 font-['Poppins'] text-white sm:px-8 md:px-10 lg:px-[5.2%] lg:py-[clamp(30px,3vw,56px)]">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-12 lg:grid-cols-[27%_1fr] lg:gap-[clamp(28px,3.6vw,70px)]">
        <aside className="order-2 lg:sticky lg:top-6 lg:order-1 lg:self-start">
          <BlogSidebar recent={recent} />
        </aside>

        <main className="order-1 min-w-0 lg:order-2">
          <ArticleHeader article={article} />
          <ArticleBody article={article} />
          <Discussion />
          <KeepReading posts={related} />
        </main>
      </div>
    </section>
  )
}

export default BlogDetails