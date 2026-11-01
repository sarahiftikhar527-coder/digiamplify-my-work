const Card = ({ icon: Icon, title, children, className = "" }) => (
  <section className={`rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5 ${className}`}>
    <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
      {Icon && <Icon size={15} className="text-white/80" />}
      {title}
    </h3>
    {children}
  </section>
);

export default Card;