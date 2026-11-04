import { createPrismaModel } from "../../models/prismaModelHelper.js";

const Announcement = createPrismaModel("announcement", {
  createdBy: "createdById",
});

export default Announcement;
