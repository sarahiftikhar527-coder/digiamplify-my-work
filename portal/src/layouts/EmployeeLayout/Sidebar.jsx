import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { navigation } from '@/constants'
import UserCard from './UserCard'

const Logo = () => (
  <div className="flex items-end whitespace-nowrap text-[23px] font-semibold leading-none tracking-tight text-white">
    <span>DigiA</span>
    <span className="mx-[3px] mb-[3px] flex items-end gap-[2px]">
      <span className="h-[8px] w-[4px] rounded-[1px] bg-primary" />
      <span className="h-[14px] w-[4px] rounded-[1px] bg-primary" />
      <span className="h-[21px] w-[4px] rounded-[1px] bg-primary-light" />
    </span>
    <span>plify</span>
    <span className="text-primary-light">.</span>
  </div>
)

const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) {
      onClose()
    }
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 cursor-pointer bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`relative z-50 flex h-full w-[225px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(90deg,#000_0%,#000_84%,#1c0307_93%,#4a0a10_100%)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between gap-2 px-4 pb-9 pt-8">
            <Logo />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="relative z-[60] flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex flex-col gap-3 px-3"
          >
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[#F0202F] to-[#9B0E18] font-medium text-white shadow-[0_6px_20px_rgba(193,18,31,0.22)]'
                      : 'text-white/90 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon
                  size={19}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="shrink-0">
          <UserCard />
        </div>
      </aside>
    </>
  )
}

export default Sidebar