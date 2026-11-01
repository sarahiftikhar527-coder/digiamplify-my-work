export const NOTIFICATION_TYPES = [
  "employee",
  "task",
  "message",
  "profile",
  "leave",
  "meeting",
  "announcement",
  "system",
];

export const NOTIFICATION_TAGS = [
  "HR & Admin",
  "Tasks",
  "Messages",
  "System",
];

export const PURPOSES = {
  announcement: {
    tag: "HR & Admin",
  },
  task: {
    tag: "Tasks",
    link: "/task",
    linkLabel: "Open Tasks",
  },
  meeting: {
    tag: "HR & Admin",
  },
  message: {
    tag: "Messages",
    link: "/chat",
    linkLabel: "Open Messages",
  },
  system: {
    tag: "System",
  },
};

export const PREFERENCE_DEFAULTS = [
  { key: "email", label: "Email Notifications", on: true },
  { key: "push", label: "Push Notifications", on: true },
  { key: "tasks", label: "Task Reminders", on: true },
  { key: "system", label: "System Alerts", on: true },
];