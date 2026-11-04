import { createPrismaModel } from "./prismaModelHelper.js";

const Finance = createPrismaModel("finance", {
  employee: "employeeId",
  createdBy: "createdById",
  updatedBy: "updatedById",
});

export default Finance;
