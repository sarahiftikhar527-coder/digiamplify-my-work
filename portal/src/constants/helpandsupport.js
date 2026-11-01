export const ISSUE_TYPES = [
  "Technical Issue",
  "Login / Access Problem",
  "Attendance / Clock In",
  "Payroll / Finance",
  "Leave Request",
  "Task / Project",
  "Chat / Communication",
  "Account / Profile",
  "Other",
];

export const PRIORITIES = [
  { value: "high", label: "High", color: "text-red-500" },
  { value: "medium", label: "Medium", color: "text-amber-400" },
  { value: "low", label: "Low", color: "text-green-500" },
];

export const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
];

export const ALLOWED_EXT = ["pdf", "doc", "docx", "png", "jpg", "jpeg"];
export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const LIMITS = { issueType: 80, subject: 120, description: 2000 };