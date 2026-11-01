import Avatar from './Avatar'

export default function AvatarStack({ users = [], size = 'sm', max = 4 }) {
  const visible = users.slice(0, max)
  const remaining = Math.max(users.length - max, 0)

  return (
    <div className="flex items-center">
      {visible.map((user, index) => (
        <div
          key={user.id || user.name || index}
          className="-ml-2 first:ml-0 rounded-full border-2 border-[#0B0B0B]"
        >
          <Avatar
            src={user.src}
            name={user.name}
            alt={user.name}
            size={size}
          />
        </div>
      ))}

      {remaining > 0 && (
        <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B0B0B] bg-white/10 text-[10px] text-white">
          +{remaining}
        </div>
      )}
    </div>
  )
}