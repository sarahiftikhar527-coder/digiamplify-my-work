import { TeamLiveBoard } from "@/shared/teamLive";

/**
 * Employee "Team Live" page.
 * Every colleague's clock-ins, breaks and clock-outs for today,
 * so the whole team can see who is working right now.
 */
const TeamLivePage = () => (
  <div className="min-h-full bg-black text-white">
    <header className="px-6 pt-6">
      <h1 className="text-3xl font-medium text-white">
        Team <span className="text-red-600">Live</span>
      </h1>
      <p className="mt-1 text-sm text-neutral-300">
        See when everyone clocked in today and how long they have worked.
      </p>
    </header>

    <TeamLiveBoard mode="employee" />
  </div>
);

export default TeamLivePage;