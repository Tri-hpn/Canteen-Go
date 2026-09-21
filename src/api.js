const BASE = import.meta.env.VITE_API_URL || "/api";

export function getToken() { return sessionStorage.getItem("token"); }
export function setToken(t) {
  if (t) sessionStorage.setItem("token", t);
  else sessionStorage.removeItem("token");
}

async function req(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  _base: BASE,

  login:          (email, password) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register:       (data) => req("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me:             () => req("/auth/me"),
  updateProfile:  (data) => req("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data) => req("/auth/password", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data) => req("/auth/password", { method: "PUT", body: JSON.stringify(data) }),
  stats:          () => req("/stats"),

  menu: {
    list: (q = "", category = "Tất cả", sort = "popular", all = false) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category && category !== "Tất cả") params.set("category", category);
      if (sort) params.set("sort", sort);
      if (all) params.set("all", "1");
      const qs = params.toString();
      return req("/menu" + (qs ? "?" + qs : ""));
    },
    get:    (id) => req(`/menu/${id}`),
    create: (data) => req("/menu", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/menu/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/menu/${id}`, { method: "DELETE" })
  },

  orders: {
    create:    (data) => req("/orders", { method: "POST", body: JSON.stringify(data) }),
    myOrders:  () => req("/orders/me"),
    all:       (status = "Tất cả") => req(`/orders?status=${encodeURIComponent(status)}`),
    setStatus: (id, status) => req(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    received:  (id) => req(`/orders/${id}/received`, { method: "POST" }),
    cancel:    (id) => req(`/orders/${id}/cancel`, { method: "POST" })
  },

  users: {
    list:   (role) => req(`/users${role ? `?role=${role}` : ""}`),
    create: (data) => req("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/users/${id}`, { method: "DELETE" })
  },

  inventory: {
    list:    () => req("/inventory"),
    create:  (data) => req("/inventory", { method: "POST", body: JSON.stringify(data) }),
    update:  (code, data) => req(`/inventory/${code}`, { method: "PUT", body: JSON.stringify(data) }),
    remove:  (code) => req(`/inventory/${code}`, { method: "DELETE" }),
    import:  (code, data) => req(`/inventory/${code}/import`, { method: "POST", body: JSON.stringify(data) }),
    imports: () => req("/inventory/imports")
  },

  attendance: {
    today:     () => req("/attendance/today"),
    me:        () => req("/attendance/me"),
    checkIn:   (data) => req("/attendance/checkin", { method: "POST", body: JSON.stringify(data || {}) }),
    checkOut:  (data) => req("/attendance/checkout", { method: "POST", body: JSON.stringify(data || {}) }),
    all:       (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return req("/attendance" + (q ? `?${q}` : ""));
    },
    employees: () => req("/attendance/employees")
  },

  wallet: {
    me:           () => req("/wallet/me"),
    transactions: () => req("/wallet/transactions"),
    deposit:      (data) => req("/wallet/deposit", { method: "POST", body: JSON.stringify(data) }),
    withdraw:     (data) => req("/wallet/withdraw", { method: "POST", body: JSON.stringify(data) }),
    linkBank:     (data) => req("/wallet/link-bank", { method: "POST", body: JSON.stringify(data) }),
    pay:          (data) => req("/wallet/pay", { method: "POST", body: JSON.stringify(data) }),
    requests:     (status) => req("/wallet/requests" + (status ? "?status=" + status : "")),
    all:          () => req("/wallet/all"),
    stats:        () => req("/wallet/stats"),
    approve:      (id, note) => req("/wallet/requests/" + id + "/approve", { method: "PATCH", body: JSON.stringify({ admin_note: note || "" }) }),
    reject:       (id, note) => req("/wallet/requests/" + id + "/reject", { method: "PATCH", body: JSON.stringify({ admin_note: note || "" }) })
  },
  reviews: {
    me:        () => req("/reviews/me"),
    list:      (menuItemId) => req(`/reviews/${menuItemId}`),
    create:    (data) => req("/reviews", { method: "POST", body: JSON.stringify(data) }),
    canReview: (menuItemId) => req(`/reviews/can-review/${menuItemId}`)
  },

  points: {
    me:     () => req("/points/me"),
    redeem: (data) => req("/points/redeem", { method: "POST", body: JSON.stringify(data) })
  },

  vouchers: {
    me:       () => req("/vouchers/me"),
    public:   () => req("/vouchers/public"),
    claim:    (id) => req(`/vouchers/claim/${id}`, { method: "POST" }),
    validate: (code) => req("/vouchers/validate", { method: "POST", body: JSON.stringify({ code }) }),
    all:      () => req("/vouchers"),
    create:   (data) => req("/vouchers", { method: "POST", body: JSON.stringify(data) }),
    update:   (id, data) => req(`/vouchers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove:   (id) => req(`/vouchers/${id}`, { method: "DELETE" })
  },

  notifications: {
    list:    () => req("/notifications"),
    read:    (id) => req(`/notifications/${id}/read`, { method: "POST" }),
    readAll: () => req("/notifications/read-all", { method: "POST" })
  },

  chat: {
    myMessages:    () => req("/chat/me"),
    conversations: () => req("/chat/conversations"),
    messagesWith:  (userId) => req(`/chat/with/${userId}`),
    send:          (data) => req("/chat/send", { method: "POST", body: JSON.stringify(data) })
  },

  toppings: {
    list: (category) => req(`/toppings${category ? `?category=${encodeURIComponent(category)}` : ""}`)
  },

  sizes: {
    list: () => req("/sizes")
  },

  backup: {
    export: () => req("/backup/export"),
    import: (data) => req("/backup/import", { method: "POST", body: JSON.stringify(data) }),
    reset:  (confirm) => req("/backup/reset", { method: "POST", body: JSON.stringify({ confirm }) }),
    stats:  () => req("/backup/stats")
  },

  reports: {
    revenue: (period = "day") => req(`/reports/revenue?period=${period}`)
  },

  settings: {
    get:    () => req("/settings"),
    update: (data) => req("/settings", { method: "PUT", body: JSON.stringify(data) })
  },

  categories: {
    list:   () => req("/categories"),
    create: (data) => req("/categories", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req("/categories/" + id, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req("/categories/" + id, { method: "DELETE" })
  },
  shifts: {
    mine:     () => req("/shifts/me"),
    all:      (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return req("/shifts" + (q ? `?${q}` : ""));
    },
    pending:  () => req("/shifts/pending"),
    register: (data) => req("/shifts/register", { method: "POST", body: JSON.stringify(data) }),
    approve:  (id) => req(`/shifts/${id}/approve`, { method: "PATCH" }),
    reject:   (id) => req(`/shifts/${id}/reject`, { method: "DELETE" }),
    update:   (id, data) => req(`/shifts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove:   (id) => req(`/shifts/${id}`, { method: "DELETE" })
  },
  

  promotions: {
    list: () => req("/promotions")
  },
  priceHistory: {
    list: (menuItemId) => req("/price-history" + (menuItemId ? "?menu_item_id=" + menuItemId : ""))
  },

  permissions: {
    all:    () => req("/permissions"),
    me:     () => req("/permissions/me"),
    ofUser: (userId) => req(`/permissions/${userId}`),
    update: (userId, custom) => req(`/permissions/${userId}`, { method: "PUT", body: JSON.stringify({ custom }) })
  }
};
