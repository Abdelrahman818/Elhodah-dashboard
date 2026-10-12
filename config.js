export const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8080";

export const endPoints = {
  sync: `${BASE_API_URL}/api/auth/sync`,
  getRole: `${BASE_API_URL}/api/auth/getRole`,
  getCurrentUser: `${BASE_API_URL}/api/auth/getCurrentUser`,
  logout: `${BASE_API_URL}/api/auth/logout`,
  products: `${BASE_API_URL}/api/products`,
  categories: (path = "") => `${BASE_API_URL}/api/categories${path}`,
  contact: `${BASE_API_URL}/api/contact`,
  users: `${BASE_API_URL}/api/users`,
  orders: `${BASE_API_URL}/api/orders`,
  dashboard: `${BASE_API_URL}/api/dashboard`,
};
