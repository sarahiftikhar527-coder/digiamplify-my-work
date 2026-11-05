import { createPrismaModel } from "./prismaModelHelper.js";

const Calendar = createPrismaModel("calendar", {
  employee: "employeeId",
  employeeId: "employeeId",
  createdBy: "createdById",
  reviewedBy: "reviewedById",
});

export default Calendar;
