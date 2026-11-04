import { createPrismaModel } from "./prismaModelHelper.js";

const Attendance = createPrismaModel("attendance", {
  user: "userId",
});

export default Attendance;
