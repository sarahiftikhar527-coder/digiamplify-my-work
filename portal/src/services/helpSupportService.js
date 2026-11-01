import { HELP_SUPPORT_CONFIG } from "../modules/employee/helpSupport/helpSupport.config.js";

async function request(path, options = {}) {
  const token = HELP_SUPPORT_CONFIG.getToken();
  const isForm = options.body instanceof FormData;
  let res;
  try {
    res = await fetch(`${HELP_SUPPORT_CONFIG.API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data; // data.errors = { subject: "..." } (optional)
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const helpSupportService = {
  createTicket: (formData) => request("/support/tickets", { method: "POST", body: formData }),
  getTickets: () => request("/support/tickets"),
  getFaqs: () => request("/support/faqs"),
};