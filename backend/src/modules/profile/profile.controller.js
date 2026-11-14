
import { randomUUID } from "node:crypto";

import {
  listEmployees,
  getProfileByUserId,
  updateProfileByUserId,
  createChangeRequest,
  getMyChangeRequest as findMyChangeRequest,
  listChangeRequests,
  countPendingChangeRequests,
  reviewChangeRequest,
} from "./profile.service.js";

import { buildProfileDocumentUrl } from "../../utils/fileUrls.js";

const currentUserId = (req) =>
  req.user?._id || req.user?.id || req.user?.userId;

const getRole = (req) =>
  String(req.user?.role || "").toLowerCase();

const getPosition = (req) =>
  String(req.user?.position || "").toLowerCase();

const isAdmin = (req) =>
  ["admin", "superadmin"].includes(getRole(req));

const isFinanceManager = (req) =>
  getRole(req) === "employee" &&
  getPosition(req) === "finance_manager";

const canViewEmployeeList = (req) =>
  isAdmin(req) || isFinanceManager(req);

const requireAdmin = (req, res, message) => {
  if (isAdmin(req)) return true;

  res.status(403).json({
    success: false,
    message,
  });

  return false;
};

const getSavedDocuments = (profile) =>
  Array.isArray(profile?.documents) ? profile.documents : [];

const createUploadError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildUploadedDocument = (req) => {
  if (!req.file) {
    throw createUploadError("Please select a file to upload.");
  }

  return {
    id: randomUUID(),
    label: req.file.originalname,
    kind: "file",
    fileName: req.file.originalname,
    url: buildProfileDocumentUrl(req.file.filename),
    backFileName: "",
    backUrl: "",
    uploadedOn: new Date().toISOString(),
    status: "pending",
  };
};

const buildUploadedAvatar = (req) => {
  if (!req.file) {
    throw createUploadError("Please select a photo to upload.");
  }

  if (!String(req.file.mimetype || "").startsWith("image/")) {
    throw createUploadError(
      "The profile photo must be an image file."
    );
  }

  const url = buildProfileDocumentUrl(req.file.filename);

  if (!url) {
    throw createUploadError(
      "Unable to generate the profile photo URL.",
      500
    );
  }

  return {
    url,
    avatarUrl: url,
    fileName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  };
};

const saveUploadedDocument = async (userId, req) => {
  const document = buildUploadedDocument(req);
  const existingProfile = await getProfileByUserId(userId);
  const documents = getSavedDocuments(existingProfile);

  const updatedProfile = await updateProfileByUserId(
    userId,
    {
      documents: [...documents, document],
    }
  );

  return {
    profile: updatedProfile,
    document,
  };
};

export const getEmployees = async (req, res, next) => {
  try {
    if (!canViewEmployeeList(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view the employee list.",
      });
    }

    const employees = await listEmployees();

    return res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const profile = await getProfileByUserId(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeProfile = async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can view other employee profiles."
      )
    ) {
      return;
    }

    const profile = await getProfileByUserId(req.params.userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (isAdmin(req)) {
      const profile = await updateProfileByUserId(
        userId,
        req.body,
        { selfService: true }
      );

      return res.status(200).json({
        success: true,
        message: "Profile saved successfully.",
        data: profile,
      });
    }

    const request = await createChangeRequest(userId, req.body);

    return res.status(202).json({
      success: true,
      pendingApproval: true,
      message:
        "Your changes were sent to the admin for approval. They will be saved once approved.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyChangeRequest = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const request = await findMyChangeRequest(userId);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeProfile = async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can edit employee profiles."
      )
    ) {
      return;
    }

    const profile = await updateProfileByUserId(
      req.params.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Employee profile saved successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMyDocument = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!req.file) {
      throw createUploadError("Please select a document.");
    }

    if (!isAdmin(req)) {
      const document = buildUploadedDocument(req);

      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          "Document uploaded. It will be saved after admin approval.",
        data: {
          ...document,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    }

    const result = await saveUploadedDocument(userId, req);

    return res.status(201).json({
      success: true,
      message: "Document uploaded and saved successfully.",
      data: {
        ...result.document,
        size: req.file.size,
        mimeType: req.file.mimetype,
        profile: result.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadEmployeeDocument = async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can upload documents for employees."
      )
    ) {
      return;
    }

    const result = await saveUploadedDocument(
      req.params.userId,
      req
    );

    return res.status(201).json({
      success: true,
      message:
        "Employee document uploaded and saved successfully.",
      data: {
        ...result.document,
        size: req.file?.size,
        mimeType: req.file?.mimetype,
        profile: result.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMyAvatar = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const avatar = buildUploadedAvatar(req);

    if (isAdmin(req)) {
      const profile = await updateProfileByUserId(
        userId,
        { avatarUrl: avatar.url },
        { selfService: true }
      );

      return res.status(200).json({
        success: true,
        message:
          "Profile photo uploaded and saved successfully.",
        data: {
          ...avatar,
          profile,
        },
      });
    }

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message:
        "Photo uploaded. Please submit your profile changes for admin approval.",
      data: avatar,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadEmployeeAvatar = async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can upload photos for employees."
      )
    ) {
      return;
    }

    const avatar = buildUploadedAvatar(req);

    const profile = await updateProfileByUserId(
      req.params.userId,
      { avatarUrl: avatar.url }
    );

    return res.status(200).json({
      success: true,
      message:
        "Employee profile photo uploaded and saved successfully.",
      data: {
        ...avatar,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChangeRequests = async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can view profile requests."
      )
    ) {
      return;
    }

    const data = await listChangeRequests({
      status: req.query.status || "pending",
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getChangeRequestCount = async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can view profile requests."
      )
    ) {
      return;
    }

    const count = await countPendingChangeRequests();

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

const handleReview = (approve) => async (req, res, next) => {
  try {
    if (
      !requireAdmin(
        req,
        res,
        "Only admins can review profile requests."
      )
    ) {
      return;
    }

    const request = await reviewChangeRequest(
      req.params.requestId,
      req.user,
      {
        approve,
        note: req.body?.note,
      }
    );

    return res.status(200).json({
      success: true,
      message: approve
        ? "Changes approved and saved to the employee profile."
        : "Request rejected. The employee profile was not changed.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const approveChangeRequest = handleReview(true);
export const rejectChangeRequest = handleReview(false);
