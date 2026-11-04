import { createPrismaModel } from "./prismaModelHelper.js";

const RefreshToken = createPrismaModel("refreshToken", {
  user: "userId",
});

export default RefreshToken;
