
import * as leaveService from "./leave.service.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const sendError = (res, error) => {
  const message = error.message || "Something went wrong.";

  const status =
    /not found/i.test(message) ? 404 :
    /invalid|required|cannot|must be|too long|past|overlap|working days|only pending|already has|selected dates|under 1000/i.test(message) ? 400 :
    500;

  return res.status(status).json({
    success: false,
    message,
  });
};

export const createLeave = async (req, res) => {
  try {
    const leave = await leaveService.createLeave(getUserId(req), req.body);

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      data: leave,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getMyLeaves(getUserId(req));

    return res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const cancelMyLeave = async (req, res) => {
  try {
    const leave = await leaveService.cancelMyLeave(
      getUserId(req),
      req.params.id
    );

    return res.json({
      success: true,
      message: "Leave request cancelled.",
      data: leave,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getLeaveBalances = async (req, res) => {
  try {
    const balances = await leaveService.getLeaveBalances(getUserId(req));

    return res.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaves({
      status: req.query.status,
      employeeId: req.query.employeeId,
    });

    return res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const leave = await leaveService.reviewLeave(
      getUserId(req),
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      message: "Leave request reviewed successfully.",
      data: leave,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateLeaveRemarks = async (req, res) => {
  try {
    const leave = await leaveService.updateLeaveRemarks(
      getUserId(req),
      req.params.id,
      req.body.remarks
    );

    return res.json({
      success: true,
      message: "Leave remarks updated successfully.",
      data: leave,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
