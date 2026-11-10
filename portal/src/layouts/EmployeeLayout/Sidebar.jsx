import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { navigation } from '@/constants'
import NavGroup, { linkCls } from '../shared/NavGroup'
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

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
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

      <div
        className={`fixed left-0 top-0 z-50 h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out lg:relative ${
          isOpen ? 'w-[225px]' : 'w-0'
        }`}
      >
      <aside
        className="flex h-full w-[225px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(90deg,#000_0%,#000_84%,#1c0307_93%,#4a0a10_100%)]"
        onMouseLeave={onClose}
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
            {navigation.map((item) => {
              if (item.children?.length) {
                return (
                  <NavGroup key={item.path} item={item} onNavigate={onClose} />
                )
              }

              const { label, path, icon: Icon } = item

              return (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => linkCls(isActive)}
                >
                  <Icon size={19} strokeWidth={1.75} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="shrink-0">
          <UserCard />
        </div>
      </aside>
      </div>
    </>
  )
}

export default Sidebar