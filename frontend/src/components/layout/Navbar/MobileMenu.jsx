import { Link, NavLink } from 'react-router-dom'

export default function MobileMenu({ links = [], onClose }) {
  return (
    <div className="mt-3 border-t border-white/15 px-4 pb-4 pt-3 lg:hidden">
      <div className="flex flex-col">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `rounded-lg px-3 py-3 text-sm font-medium ${
                isActive ? 'bg-digi-red/10 text-digi-red' : 'text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 px-3">
        <Link
          to="/login"
          onClick={onClose}
          className="rounded-full bg-digi-red px-6 py-2.5 text-sm font-medium text-white"
        >
          Login
        </Link>
        <Link to="/signup" onClick={onClose} className="text-sm text-white/80">
          Signup
        </Link>
      </div>
    </div>
  )
}