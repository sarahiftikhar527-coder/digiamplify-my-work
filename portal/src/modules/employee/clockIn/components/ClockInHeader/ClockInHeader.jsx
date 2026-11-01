const ClockInHeader = ({ mode }) => (
  <div className="mb-5">
    <h1 className="text-2xl font-semibold text-white sm:text-3xl">{mode === "in" ? "Clock In" : "Clock Out"}</h1>
    <p className="mt-1 text-[13px] text-white/70">Track your hours and manage your attendance.</p>
  </div>
);

export default ClockInHeader;