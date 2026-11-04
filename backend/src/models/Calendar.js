import { createPrismaModel } from "./prismaModelHelper.js";

const Calendar = createPrismaModel("calendar", {
  employeeId: "employeeId",
  createdBy: "createdById",
  reviewedBy: "reviewedById",
});

export default Calendar;
