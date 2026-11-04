import { createPrismaModel } from "./prismaModelHelper.js";

const Profile = createPrismaModel("profile", {
  user: "userId",
});

export default Profile;
