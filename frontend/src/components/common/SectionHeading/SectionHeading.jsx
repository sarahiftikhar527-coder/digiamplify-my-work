function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = 'left',
}) {
  const titleParts = highlight ? title.split(highlight) : [title]

  return (
    <div
      className={`max-w-3xl ${
        align === 'center' ? 'mx-auto text-center' : ''
      }`}
    >
      {eyebrow && (
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-digi-red">
          {eyebrow}
        </p>
      )}

      <h2 className="font-heading text-4xl font-light leading-[1.05] tracking-tight text-white sm:text-5xl">
        {titleParts.map((part, index) => (
          <span key={`${part}-${index}`}>
            {part}
            {highlight && index === 0 && (
              <span className="text-digi-red">{highlight}</span>
            )}
          </span>
        ))}
      </h2>

      {description && (
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionHeading