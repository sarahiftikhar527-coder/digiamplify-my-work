import { createPrismaModel } from "../../models/prismaModelHelper.js";

const ShiftAssignment = createPrismaModel("shiftAssignment", {
  employee: "employeeId",
  assignedBy: "assignedById",
});

export default ShiftAssignment;
