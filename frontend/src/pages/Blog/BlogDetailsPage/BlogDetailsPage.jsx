import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import BlogDetails from '../sections/BlogDetails/BlogDetails'
import { blogPosts } from '@/data/blog/post'
import { blogArticle } from '@/data/blog/details'

const DEFAULT_READ_TIME = '6 min'

// Current post ke relevant posts: pehle same category, phir baqi
const getRelatedPosts = (current, limit) => {
  const others = blogPosts.filter((item) => item.slug !== current?.slug)
  const sameCategory = others.filter(
    (item) => item.category === current?.category
  )
  const rest = others.filter((item) => item.category !== current?.category)

  return [...sameCategory, ...rest].slice(0, limit)
}

function BlogDetailsPage() {
  const { slug } = useParams()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug])

  const post = blogPosts.find((item) => item.slug === slug)

  // Clicked post ka data article mein (layout wahi, data post ka)
  const article = post
    ? {
        ...blogArticle,
        title: post.title,
        excerpt: post.description,
        category: post.category,
        date: post.date,
        coverImage: post.image, // ArticleHeader coverImage use karta hai
        author: { ...blogArticle.author, name: post.author }, // author object chahiye
      }
    : blogArticle

  // Keep Reading (4) aur sidebar Recent Post (3): current post ke ilawa
  const related = getRelatedPosts(post, 4).map((item) => ({
    id: item.id,
    slug: item.slug,
    image: item.image,
    category: item.category,
    title: item.title,
    description: item.description,
    date: item.date,
    readTime: item.readTime ?? DEFAULT_READ_TIME,
  }))

  const recent = related.slice(0, 3)

  // key={slug}: post badalne par comments/save/like state reset ho jaye
  return (
    <BlogDetails key={slug} article={article} related={related} recent={recent} />
  )
}

export default BlogDetailsPage