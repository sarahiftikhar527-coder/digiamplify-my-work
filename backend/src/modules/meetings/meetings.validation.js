import { z } from "zod";

const id = z.string().trim().min(8, "Invalid id").max(128);

const dateField = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), { message: "Invalid date format" });

export const MEETING_TYPES = ["online", "in_person", "hybrid"];
export const MEETING_CATEGORIES = [
  "general",
  "standup",
  "review",
  "one_on_one",
  "client",
  "planning",
  "training",
  "interview",
];
export const MEETING_PRIORITIES = ["low", "normal", "high"];
export const RECURRENCES = ["none", "daily", "weekdays", "weekly", "biweekly", "monthly"];
export const RSVP_VALUES = ["accepted", "declined", "tentative"];

const MAX_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_SERIES_MS = 2 * 366 * 24 * 60 * 60 * 1000;

const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), {
    message: "Meeting link must start with http:// or https://",
  });

const meetingFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000),
  agenda: z.string().trim().max(5000),
  notes: z.string().trim().max(10000),
  meetingType: z.enum(MEETING_TYPES),
  category: z.enum(MEETING_CATEGORIES),
  priority: z.enum(MEETING_PRIORITIES),
  location: z.string().trim().max(255),
  meetingLink: link,
  startAt: dateField,
  endAt: dateField,
  tzOffset: z.coerce.number().int().min(-840).max(840),
  recurrence: z.enum(RECURRENCES),
  recurrenceUntil: dateField.nullable(),
  reminderMinutes: z.coerce.number().int().min(0).max(10080),
  attendeeIds: z.array(id).max(200),
};

function checkTimes(body, ctx) {
  if (body.startAt && body.endAt) {
    if (body.endAt <= body.startAt) {
      ctx.addIssue({ code: "custom", message: "End time must be after the start time.", path: ["endAt"] });
    } else if (body.endAt - body.startAt > MAX_DURATION_MS) {
      ctx.addIssue({ code: "custom", message: "A meeting cannot be longer than 24 hours.", path: ["endAt"] });
    }
  }

  if (body.recurrenceUntil && body.startAt) {
    if (body.recurrenceUntil < body.startAt) {
      ctx.addIssue({ code: "custom", message: "Repeat-until date must be after the meeting start.", path: ["recurrenceUntil"] });
    } else if (body.recurrenceUntil - body.startAt > MAX_SERIES_MS) {
      ctx.addIssue({ code: "custom", message: "A recurring series cannot run longer than two years.", path: ["recurrenceUntil"] });
    }
  }
}

export const createMeetingSchema = z.object({
  body: z
    .object({
      ...meetingFields,
      description: meetingFields.description.default(""),
      agenda: meetingFields.agenda.default(""),
      notes: meetingFields.notes.default(""),
      meetingType: meetingFields.meetingType.default("online"),
      category: meetingFields.category.default("general"),
      priority: meetingFields.priority.default("normal"),
      location: meetingFields.location.default(""),
      meetingLink: meetingFields.meetingLink.default(""),
      tzOffset: meetingFields.tzOffset.default(0),
      recurrence: meetingFields.recurrence.default("none"),
      recurrenceUntil: meetingFields.recurrenceUntil.optional().default(null),
      reminderMinutes: meetingFields.reminderMinutes.default(15),
      attendeeIds: meetingFields.attendeeIds.default([]),
    })
    .superRefine(checkTimes),
});

export const updateMeetingSchema = z.object({
  params: z.object({ id }),
  body: z
    .object({
      title: meetingFields.title.optional(),
      description: meetingFields.description.optional(),
      agenda: meetingFields.agenda.optional(),
      notes: meetingFields.notes.optional(),
      meetingType: meetingFields.meetingType.optional(),
      category: meetingFields.category.optional(),
      priority: meetingFields.priority.optional(),
      location: meetingFields.location.optional(),
      meetingLink: meetingFields.meetingLink.optional(),
      startAt: meetingFields.startAt.optional(),
      endAt: meetingFields.endAt.optional(),
      tzOffset: meetingFields.tzOffset.optional(),
      recurrence: meetingFields.recurrence.optional(),
      recurrenceUntil: meetingFields.recurrenceUntil.optional(),
      reminderMinutes: meetingFields.reminderMinutes.optional(),
      attendeeIds: meetingFields.attendeeIds.optional(),
    })
    .superRefine((body, ctx) => {
      if ((body.startAt && !body.endAt) || (!body.startAt && body.endAt)) {
        ctx.addIssue({ code: "custom", message: "Send both startAt and endAt together.", path: ["startAt"] });
        return;
      }
      checkTimes(body, ctx);
    }),
});

export const idParamSchema = z.object({ params: z.object({ id }) });

export const listMeetingsSchema = z.object({
  query: z
    .object({
      from: dateField.optional(),
      to: dateField.optional(),
      scope: z.enum(["mine", "all"]).optional(),
      status: z.enum(["scheduled", "cancelled", "completed", "all"]).optional(),
      category: z.enum(MEETING_CATEGORIES).optional(),
      q: z.string().trim().max(100).optional(),
    })
    .strict()
    .superRefine((q, ctx) => {
      if (q.from && q.to) {
        if (q.from > q.to) {
          ctx.addIssue({ code: "custom", message: "The from date cannot be after the to date.", path: ["to"] });
        } else if (q.to - q.from > 400 * 24 * 60 * 60 * 1000) {
          ctx.addIssue({ code: "custom", message: "Date range cannot exceed 400 days.", path: ["to"] });
        }
      }
    }),
});

export const directoryQuerySchema = z.object({
  query: z.object({ q: z.string().trim().max(100).optional() }).strict(),
});

export const rsvpSchema = z.object({
  params: z.object({ id }),
  body: z.object({ response: z.enum(RSVP_VALUES) }),
});

export const cancelSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    reason: z.string().trim().max(500).optional().default(""),
    occurrence: z.string().trim().max(40).optional(),
  }),
});

export const conflictsSchema = z.object({
  body: z
    .object({
      attendeeIds: z.array(id).max(200).default([]),
      startAt: dateField,
      endAt: dateField,
      excludeId: id.optional(),
    })
    .superRefine((b, ctx) => {
      if (b.endAt <= b.startAt) {
        ctx.addIssue({ code: "custom", message: "End time must be after the start time.", path: ["endAt"] });
      }
    }),
});