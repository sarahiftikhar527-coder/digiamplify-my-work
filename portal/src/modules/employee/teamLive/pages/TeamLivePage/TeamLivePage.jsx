import { TeamLiveBoard } from "@/shared/teamLive";

/**
 * Employee "Live Hierarchy" page.
 * Same board as the admin Live Hierarchy page:
 * Admin -> Department -> Employee -> Clock-in sessions -> Breaks,
 * with the live clock status of every person.
 */
const TeamLivePage = () => (
  <div className="min-h-full bg-black text-white">
    <header className="px-6 pt-6">
      <h1 className="text-3xl font-medium text-white">
        Live <span className="text-red-600">Hierarchy</span>
      </h1>
      <p className="mt-1 text-sm text-neutral-300">
        Who is clocked in, since when, for how long, and every break taken.
        Click a person to see all of their sessions.
      </p>
    </header>

    <TeamLiveBoard mode="employee" />
  </div>
);

export default TeamLivePage;