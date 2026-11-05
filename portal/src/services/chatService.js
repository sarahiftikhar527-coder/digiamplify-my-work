
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("digiamplify.com") ? "https://api.digiamplify.com/api/v1" : "http://localhost:5000/api/v1");

function getAuthToken() {
  return (
    localStorage.getItem("digiamplify_token") ||
    sessionStorage.getItem("digiamplify_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    null
  );
}

async function request(path, options = {}) {
  const token = getAuthToken();

  const isForm =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const body =
    options.body && !isForm && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body;

  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBaseUrl}${cleanPath}`;

  const headers = new Headers(options.headers || {});

  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  console.log("CHAT API URL:", url);
  console.log("CHAT TOKEN EXISTS:", Boolean(token));

  let response;

  try {
    response = await fetch(url, {
      ...options,
      body,
      headers,
    });
  } catch {
    throw new Error(
      "Backend se connection nahi ho raha. Check karo ke backend server running hai."
    );
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  let data = {};

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    const message = await response.text().catch(() => "");
    data = message ? { message } : {};
  }

  if (!response.ok) {
    if (response.status === 401 && !token) {
      throw new Error(
        "Authentication token nahi mila. Please dobara login karo."
      );
    }

    throw new Error(
      data.message ||
        data.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

export const chatService = {
  getConversations: () =>
    request("/chat/conversations"),

  getAdminConversation: () =>
    request("/chat/conversations/admin", {
      method: "POST",
    }),

  createConversation: (payload) =>
    request("/chat/conversations", {
      method: "POST",
      body: payload,
    }),

  addMembers: (id, memberIds) =>
    request(`/chat/conversations/${id}/members`, {
      method: "POST",
      body: { memberIds },
    }),

  clearChat: (id) =>
    request(`/chat/conversations/${id}/messages`, {
      method: "DELETE",
    }),

  exitGroup: (id) =>
    request(`/chat/conversations/${id}/leave`, {
      method: "POST",
    }),

  markRead: (id) =>
    request(`/chat/conversations/${id}/read`, {
      method: "POST",
    }),

  getMessages: (id, before) => {
    const query = before
      ? `?before=${encodeURIComponent(before)}`
      : "";

    return request(
      `/chat/conversations/${id}/messages${query}`
    );
  },

  sendMessage: (id, payload) =>
    request(`/chat/conversations/${id}/messages`, {
      method: "POST",
      body: payload,
    }),

  deleteMessage: (id, messageId) =>
    request(
      `/chat/conversations/${id}/messages/${messageId}`,
      {
        method: "DELETE",
      }
    ),

  reactToMessage: (id, messageId, emoji) =>
    request(
      `/chat/conversations/${id}/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: { emoji },
      }
    ),

  pinMessage: (id, messageId, pinned) =>
    request(
      `/chat/conversations/${id}/messages/${messageId}/pin`,
      {
        method: "PATCH",
        body: { pinned },
      }
    ),

  forwardMessage: (messageId, conversationIds) =>
    request(`/chat/messages/${messageId}/forward`, {
      method: "POST",
      body: { conversationIds },
    }),

  getUsers: (search = "") =>
    request(
      `/chat/users?search=${encodeURIComponent(search)}`
    ),

  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return request("/chat/attachments", {
      method: "POST",
      body: formData,
    });
  },
};

export default chatService;
