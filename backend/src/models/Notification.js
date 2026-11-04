import { createPrismaModel } from "./prismaModelHelper.js";

const Notification = createPrismaModel("notification", {
  to: "toId",
  from: "fromId",
});

export default Notification;
