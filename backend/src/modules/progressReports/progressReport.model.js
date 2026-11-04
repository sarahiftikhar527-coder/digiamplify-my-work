import { createPrismaModel } from "../../models/prismaModelHelper.js";

const ProgressReport = createPrismaModel("progressReport", {
  employee: "employeeId",
  reviewedBy: "reviewedById",
});

export default ProgressReport;
