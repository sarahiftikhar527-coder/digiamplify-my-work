import { useLocation } from 'react-router-dom'
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { navigation } from '@/constants'
import Breadcrumb from '../Breadcrumb'
import NotificationBell from '@/modules/notifications/components/NotificationBell/NotificationBell'

const Topbar = ({
  onMenuClick = () => {},
  onMenuHover = () => {},
  sidebarOpen = true,
}) => {
  const { pathname } = useLocation()

  const current = navigation.find(
    (item) =>
      pathname === item.path ||
      pathname.startsWith(`${item.path}/`)
  )

  const items =
    pathname === '/dashboard' || pathname === '/'
      ? [
          { label: 'Home', to: '/dashboard' },
          { label: 'Dashboard' },
        ]
      : [{ label: current?.label || 'Page' }]

  return (
    <header className="relative z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 px-4 sm:px-5 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          onMouseEnter={onMenuHover}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="relative z-10 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 hover:text-[#F0202F]"
        >
          {sidebarOpen ? (
            <PanelLeftClose size={22} />
          ) : (
            <PanelLeft size={22} />
          )}
        </button>

        <div className="min-w-0">
          <Breadcrumb items={items} />
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-4">
        <NotificationBell viewAllPath="/notifications" />

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-white/5"
          aria-label="User menu"
        >
          <span className="h-9 w-9 rounded-full bg-gray-200" />
          <ChevronDown size={17} className="text-white" />
        </button>
      </div>
    </header>
  )
}

export default Topbar