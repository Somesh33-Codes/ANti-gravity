// API Client — central service layer (Somesh: Dashboard & Features, Snigdha: Frontend UI)
// All API base URL configuration driven by environment variable

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("sp_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body = null, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options.headers,
  };

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(url, config);

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({ detail: "Unexpected server response." }));

  if (!res.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg).join(", ")
        : "An error occurred. Please try again.";
    throw new Error(message);
  }

  return data;
}

// Auth
export const authApi = {
  register: (body) => request("POST", "/api/auth/register", body),
  login: (body) => request("POST", "/api/auth/login", body),
  me: () => request("GET", "/api/auth/me"),
  demoAccounts: () => request("GET", "/api/auth/demo-accounts"),
};

// Challenges
export const challengesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request("GET", `/api/challenges${q ? "?" + q : ""}`);
  },
  get: (idOrSlug) => request("GET", `/api/challenges/${idOrSlug}`),
  create: (body) => request("POST", "/api/challenges", body),
};

// Submissions
export const submissionsApi = {
  mySubmissions: () => request("GET", "/api/submissions/my"),
  submit: (body) => request("POST", "/api/submissions", body),
  get: (id) => request("GET", `/api/submissions/${id}`),
};

// Skill Passport
export const passportApi = {
  mine: () => request("GET", "/api/passport/me"),
  student: (id) => request("GET", `/api/passport/${id}`),
  qrUrl: (id) => `${BASE_URL}/api/passport/${id}/qr`,
};

// Employer
export const employerApi = {
  candidates: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request("GET", `/api/employer/candidates${q ? "?" + q : ""}`);
  },
  reveal: (studentId) =>
    request("POST", "/api/employer/candidates/reveal", { student_id: studentId }),
  invite: (studentId, note) =>
    request("POST", "/api/employer/candidates/invite", {
      student_id: studentId,
      note,
    }),
};
