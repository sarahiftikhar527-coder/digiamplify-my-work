
import apiClient, { unwrap } from "./apiClient";

const getData = (response) => unwrap(response);

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.leaves)) return data.leaves;
  if (Array.isArray(data?.requests)) return data.requests;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getMyLeaves = async () => {
  const data = await getData(apiClient.get("/leaves/mine"));
  return getList(data);
};

export const getMyLeaveBalances = async () => {
  const data = await getData(apiClient.get("/leaves/balances"));

  const balances = Array.isArray(data)
    ? data
    : data?.balances ||
      data?.leaveTypes ||
      data?.items ||
      [];

  return balances.map((item) => {
    const total = Number(item.total ?? item.entitlement ?? 0);
    const used = Number(item.used ?? 0);
    const reserved = Number(item.reserved ?? 0);

    return {
      name: item.name || item.type || "Unknown",
      total,
      used,
      reserved,
      remaining: Number(
        item.remaining ?? Math.max(0, total - used - reserved)
      ),
    };
  });
};

export const createLeaveRequest = async (payload) => {
  return getData(apiClient.post("/leaves", payload));
};

export const cancelLeaveRequest = async (id) => {
  return getData(
    apiClient.patch(`/leaves/${id}/cancel`)
  );
};

export const getAllLeaveRequests = async () => {
  const data = await getData(apiClient.get("/leaves"));
  return getList(data);
};

export const reviewLeaveRequest = async (id, payload) => {
  return getData(
    apiClient.patch(`/leaves/${id}/review`, {
      status: payload.status,
      remarks: payload.remarks || "",
    })
  );
};

export const updateLeaveRemarks = async (id, remarks) => {
  return getData(
    apiClient.patch(`/leaves/${id}/remarks`, { remarks })
  );
};
