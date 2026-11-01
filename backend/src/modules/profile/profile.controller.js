
import { randomUUID } from "node:crypto";
import {
  listEmployees,
  getProfileByUserId,
  updateProfileByUserId,
} from "./profile.service.js";

const currentUserId = (req) =>
  req.user?._id || req.user?.id || req.user?.userId;

const isAdmin = (req) =>
  ["admin", "superadmin"].includes(
    String(req.user?.role || "").toLowerCase()
  );

const getSavedDocuments = (profile) =>
  Array.isArray(profile?.documents) ? profile.documents : [];

const saveUploadedDocument = async (userId, req) => {
  if (!req.file) {
    const error = new Error("Please select a file to upload.");
    error.statusCode = 400;
    throw error;
  }

  const existingProfile = await getProfileByUserId(userId);

  const documents = getSavedDocuments(existingProfile);

  const uploadedOn = new Date().toISOString();

  const document = {
    id: randomUUID(),
    label: req.file.originalname,
    kind: "file",
    fileName: req.file.originalname,
    url: `/uploads/profile-documents/${req.file.filename}`,
    backFileName: "",
    backUrl: "",
    uploadedOn,
    status: "pending",
  };

  const updatedProfile = await updateProfileByUserId(userId, {
    documents: [...documents, document],
  });

  return {
    profile: updatedProfile,
    document,
  };
};

export const getEmployees = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view the employee list.",
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
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view other employee profiles.",
      });
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
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeProfile = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can edit employee profiles.",
      });
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

    const result = await saveUploadedDocument(userId, req);

    return res.status(201).json({
      success: true,
      message: "Document uploaded and saved successfully.",
      data: {
        ...result.document,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadEmployeeDocument = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can upload documents for employees.",
      });
    }

    const result = await saveUploadedDocument(
      req.params.userId,
      req
    );

    return res.status(201).json({
      success: true,
      message: "Employee document uploaded and saved successfully.",
      data: {
        ...result.document,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};
