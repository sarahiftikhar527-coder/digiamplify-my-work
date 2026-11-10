import apiClient, { unwrap } from "./api/apiClient";

const asArray = (value) => (Array.isArray(value) ? value : []);

export const meetingsService = {
  async list(params = {}) {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    return asArray(await unwrap(apiClient.get("/meetings", { params: clean })));
  },

  get: (id) => unwrap(apiClient.get(`/meetings/${id}`)),

  create: (payload) => unwrap(apiClient.post("/meetings", payload)),

  update: (id, payload) => unwrap(apiClient.patch(`/meetings/${id}`, payload)),

  respond: (id, response) => unwrap(apiClient.patch(`/meetings/${id}/rsvp`, { response })),

  cancel: (id, body = {}) => unwrap(apiClient.post(`/meetings/${id}/cancel`, body)),

  complete: (id) => unwrap(apiClient.post(`/meetings/${id}/complete`)),

  remove: (id) => unwrap(apiClient.delete(`/meetings/${id}`)),

  async directory(q = "") {
    return asArray(await unwrap(apiClient.get("/meetings/directory", { params: q ? { q } : {} })));
  },

  summary: (tzOffset) => unwrap(apiClient.get("/meetings/summary", { params: { tzOffset } })),

  async conflicts(body) {
    return asArray(await unwrap(apiClient.post("/meetings/conflicts", body)));
  },
};

export const meetingErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;

export default meetingsService;