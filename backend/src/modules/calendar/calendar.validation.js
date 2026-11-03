import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const eventTypeEnum = z.enum(["holiday", "leave", "shift", "attendance"]);

const statusEnum = z.enum([
  "pending",
  "approved",
  "rejected",
  "scheduled",
  "completed",
  "absent",
  "cancelled",
]);

const leaveTypeEnum = z.enum(["Sick", "Casual", "Annual", "Unpaid"]);

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000;

const parseDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const dateField = z.string().trim().min(1).max(64);

const validateDateRange = (from, to, ctx) => {
  const start = parseDate(from);
  const end = parseDate(to);

  if (!start || !end) {
    ctx.addIssue({
      code: "custom",
      message: "Valid from and to dates are required.",
      path: ["from"],
    });
    return;
  }

  if (start > end) {
    ctx.addIssue({
      code: "custom",
      message: "The from date cannot be after the to date.",
      path: ["to"],
    });
  }

  if (end.getTime() - start.getTime() > MAX_RANGE_MS) {
    ctx.addIssue({
      code: "custom",
      message: "Date range cannot exceed one year.",
      path: ["to"],
    });
  }
};

export const listEventsSchema = z
  .object({
    query: z
      .object({
        from: dateField.optional(),
        to: dateField.optional(),
        eventType: eventTypeEnum.optional(),
        status: statusEnum.optional(),
        employeeId: objectId.optional(),
      })
      .strict()
      .superRefine((query, ctx) => {
        if (query.from && query.to) {
          validateDateRange(query.from, query.to, ctx);
        }
      }),
  })
  .strict();

export const idParamSchema = z
  .object({
    params: z.object({ id: objectId }).strict(),
  })
  .strict();

export const approversQuerySchema = z
  .object({
    query: z
      .object({
        q: z.string().trim().max(100).optional(),
      })
      .strict(),
  })
  .strict();

const attachmentSchema = z.record(z.string(), z.unknown()).or(z.any());

const createBodyBase = z
  .object({
    eventType: eventTypeEnum,
    title: z.string().trim().max(200).optional(),
    subject: z.string().trim().max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    from: dateField,
    to: dateField,
    leaveType: leaveTypeEnum.optional(),
    approverIds: z
      .union([
        z.array(objectId).max(10),
        z.string().trim().max(2000),
      ])
      .optional(),
    startTime: z.string().trim().max(20).optional(),
    endTime: z.string().trim().max(20).optional(),
    attachments: z.union([z.array(attachmentSchema).max(20), z.any()]).optional(),
    employeeId: objectId.optional(),
  })
  .strict()
  .superRefine((body, ctx) => {
    validateDateRange(body.from, body.to, ctx);

    if (body.eventType === "leave") {
      const title = (body.title || body.subject || "").trim();

      if (!title) {
        ctx.addIssue({
          code: "custom",
          message: "Leave subject is required.",
          path: ["title"],
        });
      }

      if (!(body.description || "").trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Leave description is required.",
          path: ["description"],
        });
      }

      if (!body.leaveType) {
        ctx.addIssue({
          code: "custom",
          message: "Leave type is required.",
          path: ["leaveType"],
        });
      }

      const hasApprovers =
        (Array.isArray(body.approverIds) && body.approverIds.length > 0) ||
        (typeof body.approverIds === "string" &&
          body.approverIds.trim().length > 0);

      if (!hasApprovers) {
        ctx.addIssue({
          code: "custom",
          message: "At least one approver is required.",
          path: ["approverIds"],
        });
      }
    }
  });

export const createEventSchema = z
  .object({
    body: createBodyBase,
  })
  .strict();

export const updateEventSchema = z
  .object({
    params: z.object({ id: objectId }).strict(),
    body: z
      .object({
        title: z.string().trim().max(200).optional(),
        subject: z.string().trim().max(200).optional(),
        description: z.string().trim().max(5000).optional(),
        from: dateField.optional(),
        to: dateField.optional(),
        leaveType: leaveTypeEnum.optional(),
        startTime: z.string().trim().max(20).optional(),
        endTime: z.string().trim().max(20).optional(),
        employeeName: z.string().trim().max(100).optional(),
        role: z.string().trim().max(50).optional(),
        employeeId: objectId.optional(),
      })
      .strict()
      .superRefine((body, ctx) => {
        if (body.from && body.to) {
          validateDateRange(body.from, body.to, ctx);
        }
      }),
  })
  .strict();

export const updateStatusSchema = z
  .object({
    params: z.object({ id: objectId }).strict(),
    body: z
      .object({
        status: z.enum(["approved", "rejected"]),
      })
      .strict(),
  })
  .strict();
