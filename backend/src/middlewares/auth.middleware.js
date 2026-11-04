import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/db.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: payload.sub,
      isDeleted: false,
      status: "active",
    },
  });

  if (!user) {
    throw new ApiError(401, "User not found or inactive");
  }

  user._id = user.id;
  req.user = user;
  next();
});
