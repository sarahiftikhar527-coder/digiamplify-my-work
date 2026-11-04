import mongoose from "../../utils/mongooseCompat.js";
import Announcement from "./announcement.model.js";
import User from "../../models/User.js";
import ApiError from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ROLES } from "../../constants/roles.js";

const getAnnouncementPayload = (body = {}) => {
  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();
  const audience = body.audience || "all";
  const priority = body.priority || "normal";
  const status = body.status || "published";

  if (!title) {
    throw new ApiError(400, "Announcement title is required");
  }

  if (!message) {
    throw new ApiError(400, "Announcement message is required");
  }

  if (!["all", "selected"].includes(audience)) {
    throw new ApiError(400, "Invalid announcement audience");
  }

  if (!["normal", "high", "urgent"].includes(priority)) {
    throw new ApiError(400, "Invalid announcement priority");
  }

  if (!["published", "draft"].includes(status)) {
    throw new ApiError(400, "Invalid announcement status");
  }

  const employeeIds = Array.isArray(body.employeeIds)
    ? [...new Set(body.employeeIds.map(String))]
    : [];

  if (employeeIds.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "Invalid employee selection");
  }

  if (audience === "selected" && employeeIds.length === 0) {
    throw new ApiError(
      400,
      "Select at least one employee for this audience"
    );
  }

  return {
    title,
    message,
    audience,
    employeeIds: audience === "all" ? [] : employeeIds,
    priority,
    status,
  };
};

const validateSelectedEmployees = async (employeeIds) => {
  if (!employeeIds.length) return;

  const employees = await User.find({
    _id: { $in: employeeIds },
    role: { $ne: ROLES.ADMIN },
    status: "active",
    isDeleted: false,
  })
    .select("_id")
    .lean();

  if (employees.length !== employeeIds.length) {
    throw new ApiError(
      400,
      "One or more selected employees are unavailable"
    );
  }
};

const populateAnnouncement = (query) =>
  query
    .populate("createdBy", "name email")
    .populate("employeeIds", "name email department designation");

export const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await populateAnnouncement(
    Announcement.find()
  )
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: announcements,
  });
});

export const getMyAnnouncements = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const announcements = await Announcement.find({
    status: "published",
    $or: [
      { audience: "all" },
      {
        audience: "selected",
        employeeIds: employeeId,
      },
    ],
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: announcements,
  });
});

export const getAnnouncementEmployees = asyncHandler(
  async (req, res) => {
    const employees = await User.find({
      role: { $ne: ROLES.ADMIN },
      status: "active",
      isDeleted: false,
    })
      .select("name email department designation")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: employees.map((employee) => ({
        ...employee,
        id: employee._id.toString(),
      })),
    });
  }
);

export const createAnnouncement = asyncHandler(async (req, res) => {
  const payload = getAnnouncementPayload(req.body);

  if (payload.audience === "selected") {
    await validateSelectedEmployees(payload.employeeIds);
  }

  const announcement = await Announcement.create({
    ...payload,
    createdBy: req.user._id,
  });

  const result = await populateAnnouncement(
    Announcement.findById(announcement._id)
  ).lean();

  res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    data: result,
  });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid announcement ID");
  }

  const payload = getAnnouncementPayload(req.body);

  if (payload.audience === "selected") {
    await validateSelectedEmployees(payload.employeeIds);
  }

  const announcement = await populateAnnouncement(
    Announcement.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    )
  );

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.status(200).json({
    success: true,
    message: "Announcement updated successfully",
    data: announcement,
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid announcement ID");
  }

  const announcement = await Announcement.findByIdAndDelete(
    req.params.id
  );

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.status(200).json({
    success: true,
    message: "Announcement deleted successfully",
    data: { id: announcement._id },
  });
});