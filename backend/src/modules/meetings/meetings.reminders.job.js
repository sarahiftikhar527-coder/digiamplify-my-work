import { runReminderSweep } from "./meetings.service.js";

let timer = null;
let running = false;

export function startMeetingReminders({ intervalMs = 60 * 1000 } = {}) {
  if (timer || process.env.NODE_ENV === "test") return;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runReminderSweep();
    } catch (error) {
      console.error("Meeting reminder sweep failed:", error?.message || error);
    } finally {
      running = false;
    }
  };

  timer = setInterval(tick, intervalMs);
  timer.unref?.();
  tick();
}

export function stopMeetingReminders() {
  if (timer) clearInterval(timer);
  timer = null;
}