import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

import {
  isAdmin,
  forbidden,
  eventOwnerId,
  isCompanyHoliday,
  canEmployeeReadEvent,
  canEmployeeMutateEvent,
  assertEmployeeCreateEventType,
} from "../src/modules/calendar/calendar.auth.js";

import {
  listEventsSchema,
  createEventSchema,
  approversQuerySchema,
} from "../src/modules/calendar/calendar.validation.js";

const employeeId = new mongoose.Types.ObjectId();
const otherId = new mongoose.Types.ObjectId();
const holidayId = new mongoose.Types.ObjectId();

const calendarFindMock = vi.fn();
const calendarFindByIdMock = vi.fn();
const calendarCreateMock = vi.fn();
const calendarFindByIdAndUpdateMock = vi.fn();
const calendarFindByIdAndDeleteMock = vi.fn();
const userFindOneMock = vi.fn();
const userFindMock = vi.fn();

vi.mock("../src/models/Calendar.js", () => ({
  default: {
    find: (...args) => calendarFindMock(...args),
    findById: (...args) => calendarFindByIdMock(...args),
    create: (...args) => calendarCreateMock(...args),
    findByIdAndUpdate: (...args) => calendarFindByIdAndUpdateMock(...args),
    findByIdAndDelete: (...args) => calendarFindByIdAndDeleteMock(...args),
  },
}));

vi.mock("../src/models/User.js", () => ({
  default: {
    findOne: (...args) => userFindOneMock(...args),
    find: (...args) => userFindMock(...args),
  },
}));

const {
  actorFromUser,
  createCalendarEvent,
  updateCalendarEventStatus,
  searchCalendarApprovers,
} = await import("../src/modules/calendar/calendar.service.js");

describe("calendar.auth", () => {
  it("treats admin and superadmin as administrators", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
    expect(isAdmin({ role: "superadmin" })).toBe(true);
    expect(isAdmin({ role: "employee" })).toBe(false);
  });

  it("forbidden errors carry statusCode 403", () => {
    const error = forbidden("You do not have permission to view this event.");
    expect(error.statusCode).toBe(403);
  });

  it("identifies company holidays as holiday with null employeeId", () => {
    expect(
      isCompanyHoliday({ eventType: "holiday", employeeId: null })
    ).toBe(true);
    expect(
      isCompanyHoliday({
        eventType: "holiday",
        employeeId: employeeId,
      })
    ).toBe(false);
  });

  it("lets employees read own events and company holidays only", () => {
    expect(
      canEmployeeReadEvent(
        { eventType: "leave", employeeId: employeeId },
        String(employeeId)
      )
    ).toBe(true);

    expect(
      canEmployeeReadEvent(
        { eventType: "holiday", employeeId: null },
        String(otherId)
      )
    ).toBe(true);

    expect(
      canEmployeeReadEvent(
        { eventType: "shift", employeeId: otherId },
        String(employeeId)
      )
    ).toBe(false);
  });

  it("blocks employee mutation on holidays and locked statuses", () => {
    expect(
      canEmployeeMutateEvent(
        { eventType: "holiday", employeeId: null, status: "pending" },
        String(employeeId)
      )
    ).toBe(false);

    expect(
      canEmployeeMutateEvent(
        {
          eventType: "leave",
          employeeId: employeeId,
          status: "approved",
        },
        String(employeeId)
      )
    ).toBe(false);

    expect(
      canEmployeeMutateEvent(
        {
          eventType: "leave",
          employeeId: employeeId,
          status: "pending",
        },
        String(employeeId)
      )
    ).toBe(true);
  });

  it("allows employees to create leave only", () => {
    expect(() => assertEmployeeCreateEventType("leave")).not.toThrow();
    expect(() => assertEmployeeCreateEventType("shift")).toThrow(/permission/i);
  });

  it("eventOwnerId prefers employeeId then createdBy", () => {
    expect(
      eventOwnerId({ employeeId: employeeId, createdBy: otherId })
    ).toBe(String(employeeId));

    expect(
      eventOwnerId({ employeeId: null, createdBy: otherId })
    ).toBe(String(otherId));
  });
});

describe("calendar.validation", () => {
  it("rejects unknown query keys on list events", () => {
    const result = listEventsSchema.safeParse({
      query: { from: "2026-01-01", extra: "x" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects from after to and ranges over one year", () => {
    const inverted = listEventsSchema.safeParse({
      query: { from: "2026-06-01", to: "2026-01-01" },
    });

    expect(inverted.success).toBe(false);

    const tooLong = createEventSchema.safeParse({
      body: {
        eventType: "leave",
        title: "Annual leave",
        description: "Trip",
        leaveType: "Annual",
        approverIds: ["507f1f77bcf86cd799439011"],
        from: "2026-01-01",
        to: "2027-06-01",
      },
    });

    expect(tooLong.success).toBe(false);
  });

  it("approvers query schema is strict", () => {
    const result = approversQuerySchema.safeParse({
      query: { q: "admin", debug: "1" },
    });

    expect(result.success).toBe(false);
  });
});

describe("calendar.service (mocked models)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchCalendarApprovers returns id, name, role, department without email", async () => {
    userFindMock.mockReturnValue({
      select: () => ({
        limit: () => ({
          lean: async () => [
            {
              _id: employeeId,
              name: "Admin User",
              email: "secret@example.com",
              role: "admin",
              department: "HR",
            },
          ],
        }),
      }),
    });

    const rows = await searchCalendarApprovers("adm");

    expect(rows).toEqual([
      {
        id: String(employeeId),
        name: "Admin User",
        role: "admin",
        department: "HR",
      },
    ]);

    expect(rows[0].email).toBeUndefined();
  });

  it("createCalendarEvent strips non-persisted leave fields before create", async () => {
    const createdId = new mongoose.Types.ObjectId();

    calendarCreateMock.mockResolvedValue({ _id: createdId });

    calendarFindByIdMock.mockReturnValue({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            lean: async () => ({
              _id: createdId,
              eventType: "leave",
              status: "pending",
            }),
          }),
        }),
      }),
    });

    const actor = actorFromUser({ _id: employeeId, role: "employee" });

    await createCalendarEvent(actor, {
      eventType: "leave",
      title: "Sick day",
      description: "Not feeling well",
      leaveType: "Sick",
      approverIds: [String(otherId)],
      from: "2026-03-01",
      to: "2026-03-01",
      attachments: [{ name: "note.pdf" }],
    });

    const createArg = calendarCreateMock.mock.calls[0][0];

    expect(createArg.leaveType).toBeUndefined();
    expect(createArg.approverIds).toBeUndefined();
    expect(createArg.attachments).toBeUndefined();
    expect(String(createArg.employeeId)).toBe(String(employeeId));
    expect(createArg.createdBy).toBeDefined();
  });

  it("updateCalendarEventStatus rejects non-admin actors", async () => {
    const actor = actorFromUser({ _id: employeeId, role: "employee" });

    await expect(
      updateCalendarEventStatus(actor, String(holidayId), "approved")
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
