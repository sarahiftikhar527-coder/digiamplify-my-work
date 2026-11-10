import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { AuthContext } from '@/context'

const UserCard = () => {
  const auth = useContext(AuthContext)
  const user = auth?.user
  const logout = auth?.logout
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const handleLogout = () => {
    logout?.()
    navigate('/login')
  }

  const initials = (user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const showImage = user?.avatar && !imgError

  return (
    <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 pb-6 pt-4">
      <div className="flex min-w-0 items-center gap-3">
        {showImage ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            onError={() => setImgError(true)}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C0111F] text-sm font-semibold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-white">
            {user?.name || 'Jhon Ken'}
          </p>
          <p className="truncate pt-1 text-xs text-gray-400">
            {user?.role || 'App Developer'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Logout"
        title="Logout"
        className="shrink-0 rounded-md p-1 text-white/70 transition-colors hover:bg-[#F0202F]/10 hover:text-[#F0202F]"
      >
        <LogOut size={17} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default UserCard