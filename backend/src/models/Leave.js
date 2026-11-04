import { createPrismaModel } from "./prismaModelHelper.js";

const Leave = createPrismaModel("leave", {
  employee: "employeeId",
  reviewedBy: "reviewedById",
});

export default Leave;
