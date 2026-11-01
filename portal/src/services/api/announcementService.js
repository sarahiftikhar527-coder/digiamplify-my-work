
import apiClient, { unwrap } from "./apiClient";

export const getAnnouncements = async () =>
  unwrap(apiClient.get("/announcements"));

export const getAnnouncementEmployees = async () =>
  unwrap(apiClient.get("/announcements/employees"));

export const createAnnouncement = async (payload) =>
  unwrap(apiClient.post("/announcements", payload));

export const updateAnnouncement = async (id, payload) =>
  unwrap(apiClient.patch(`/announcements/${id}`, payload));

export const deleteAnnouncement = async (id) =>
  unwrap(apiClient.delete(`/announcements/${id}`));
