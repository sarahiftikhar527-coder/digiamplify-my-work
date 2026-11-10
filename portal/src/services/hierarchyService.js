import apiClient, { unwrap } from "./api/apiClient";

export const hierarchyService = {
  // { me, directors, employees }
  get: () => unwrap(apiClient.get("/hierarchy")),

  // managerId = null moves the person to the top of the hierarchy.
  setManager: (userId, managerId) =>
    unwrap(apiClient.patch(`/hierarchy/${userId}/manager`, { managerId })),
};