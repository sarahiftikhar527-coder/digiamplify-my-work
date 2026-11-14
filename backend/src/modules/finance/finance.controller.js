
import {
  getFinanceDashboard,
  getPayrollRecords,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getMyFinanceDashboard as getMyFinanceDashboardService,
  getMyPayrollRecords,
  getMyPendingPayrollCount as getMyPendingPayrollCountService,
} from "./finance.service.js";

const handleError = (res, error) => {
  if (error.code === "P2002" || error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Payroll already exists for this employee and period.",
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Finance controller error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "An internal server error occurred."
        : error.message,
  });
};

export const getDashboard = async (req, res) => {
  try {
    const data = await getFinanceDashboard(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getPayroll = async (req, res) => {
  try {
    const data = await getPayrollRecords(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMyFinanceDashboard = async (req, res) => {
  try {
    const data = await getMyFinanceDashboardService(
      req.user.id,
      req.query
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const data = await getMyPayrollRecords(
      req.user.id,
      req.query
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMyPendingPayrollCount = async (req, res) => {
  try {
    const count = await getMyPendingPayrollCountService(req.user.id);

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const addPayroll = async (req, res) => {
  try {
    const data = await createPayroll(req.body, req);

    return res.status(201).json({
      success: true,
      message: "Payroll record created successfully.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const editPayroll = async (req, res) => {
  try {
    const data = await updatePayroll(
      req.params.id,
      req.body,
      req
    );

    return res.status(200).json({
      success: true,
      message: "Payroll record updated successfully.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const removePayroll = async (req, res) => {
  try {
    const data = await deletePayroll(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Payroll record deleted successfully.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
