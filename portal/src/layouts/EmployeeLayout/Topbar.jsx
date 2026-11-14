
import { useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

import { getEmployeeNavigation } from '@/constants'
import { AuthContext } from '@/context'

import Breadcrumb from '../Breadcrumb'
import UserMenu from '../shared/UserMenu'
import NotificationBell from '@/modules/notifications/components/NotificationBell/NotificationBell'

const Topbar = ({
  onMenuClick = () => {},
  onMenuHover = () => {},
  sidebarOpen = true,
  hidden = false,
}) => {
  const { pathname } = useLocation()
  const auth = useContext(AuthContext)

  const navigation = useMemo(
    () => getEmployeeNavigation(auth?.user),
    [auth?.user]
  )

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
    <header
      className={`absolute inset-x-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-white/5 bg-black/90 px-4 backdrop-blur transition-transform duration-300 ease-in-out sm:px-5 lg:px-7 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          onMouseEnter={onMenuHover}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="relative z-10 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white transition-colors hover:bg-[#F0202F]/10 hover:text-[#F0202F]"
        >
          {sidebarOpen ? (
            <PanelLeftClose size={21} strokeWidth={1.5} />
          ) : (
            <PanelLeft size={21} strokeWidth={1.5} />
          )}
        </button>

        <div className="min-w-0">
          <Breadcrumb items={items} />
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-4">
        <NotificationBell viewAllPath="/notifications" />

        <UserMenu
          profilePath="/profile"
          notificationsPath="/notifications"
          supportPath="/help-support"
        />
      </div>
    </header>
  )
}

export default Topbar
