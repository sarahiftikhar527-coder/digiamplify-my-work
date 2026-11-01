import { Link } from 'react-router-dom'

function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-baseline text-[28px] font-bold leading-none tracking-tight text-white ${className}`}
      aria-label="DigiAmplify home"
    >
      DigiA

      {/* "m" ki jagah 3 ascending bars */}
      <span
        aria-hidden="true"
        className="mx-[3px] inline-flex h-[0.72em] items-end gap-[2px]"
      >
        <span className="h-[45%] w-[5px] rounded-[1px] bg-digi-red/70 transition-all duration-300 group-hover:h-[60%]" />
        <span className="h-[75%] w-[5px] rounded-[1px] bg-digi-red transition-all duration-300 group-hover:h-[90%]" />
        <span className="h-full w-[5px] rounded-[1px] bg-digi-red transition-all duration-300 group-hover:brightness-125" />
      </span>

      plify
      <span className="text-digi-red">.</span>
    </Link>
  )
}

export default Logo