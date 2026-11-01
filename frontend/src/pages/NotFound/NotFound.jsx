import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#d90012]">
          404 Error
        </p>

        <h1 className="text-7xl font-bold text-white md:text-9xl">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
          Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500 md:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d90012] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e50914]"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default NotFound