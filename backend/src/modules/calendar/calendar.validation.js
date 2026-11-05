import { z } from "zod";

const objectId = z.string().trim().min(1, "Invalid id");

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

const dateField = z
  .union([z.string(), z.date()])
  .transform((val) => (typeof val === "string" ? new Date(val) : val))
  .refine((d) => !Number.isNaN(d.getTime()), {
    message: "Invalid date format",
  });

const validateDateRange = (from, to, ctx) => {
  const start = from instanceof Date ? from : new Date(from);
  const end = to instanceof Date ? to : new Date(to);

  if (Number.isNaN(start.getTime())) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid from date format.",
      path: ["from"],
    });
  }

  if (Number.isNaN(end.getTime())) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid to date format.",
      path: ["to"],
    });
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
  });

export const idParamSchema = z
  .object({
    params: z.object({ id: objectId }),
  });

export const approversQuerySchema = z
  .object({
    query: z
      .object({
        q: z.string().trim().max(100).optional(),
      })
      .strict(),
  });

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
  .superRefine((body, ctx) => {
    validateDateRange(body.from, body.to, ctx);

    if (body.eventType === "leave") {
      if (!body.leaveType) {
        ctx.addIssue({
          code: "custom",
          message: "leaveType is required for leave events.",
          path: ["leaveType"],
        });
      }

      const approvers = Array.isArray(body.approverIds)
        ? body.approverIds
        : typeof body.approverIds === "string" && body.approverIds.trim()
        ? body.approverIds.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      if (approvers.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "At least one approver is required for leave requests.",
          path: ["approverIds"],
        });
      }
    }

    if (body.eventType === "holiday" && !body.title && !body.subject) {
      ctx.addIssue({
        code: "custom",
        message: "Title or subject is required for holidays.",
        path: ["title"],
      });
    }

    if (body.eventType === "shift") {
      if (!body.startTime) {
        ctx.addIssue({
          code: "custom",
          message: "startTime is required for shift events.",
          path: ["startTime"],
        });
      }
      if (!body.endTime) {
        ctx.addIssue({
          code: "custom",
          message: "endTime is required for shift events.",
          path: ["endTime"],
        });
      }
    }
  });

export const createEventSchema = z
  .object({
    body: createBodyBase,
  });

export const updateEventSchema = z
  .object({
    params: z.object({ id: objectId }),
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
      .superRefine((body, ctx) => {
        if (body.from && body.to) {
          validateDateRange(body.from, body.to, ctx);
        }
      }),
  });

export const updateStatusSchema = z
  .object({
    params: z.object({ id: objectId }),
    body: z
      .object({
        status: z.enum(["approved", "rejected"]),
      }),
  });
