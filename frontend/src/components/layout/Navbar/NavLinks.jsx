import { NavLink } from 'react-router-dom'

export default function NavLinks({ links = [], onClick }) {
  return (
    <div className="flex items-center gap-6 xl:gap-9">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          onClick={onClick}
          className={({ isActive }) =>
            `text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 xl:text-[17px] ${
              isActive ? 'text-digi-red' : 'text-white hover:text-digi-red'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  )
}