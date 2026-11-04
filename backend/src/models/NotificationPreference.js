import { createPrismaModel } from "./prismaModelHelper.js";

const NotificationPreference = createPrismaModel("notificationPreference", {
  user: "userId",
});

export default NotificationPreference;
