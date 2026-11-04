import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export default async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing.",
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not configured.");
    }

    const payload = jwt.verify(token, secret);

    if (typeof payload !== "object" || !payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        isDeleted: false,
        status: "active",
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account is unavailable.",
      });
    }

    user._id = user.id;
    req.user = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    next(error);
  }
}
