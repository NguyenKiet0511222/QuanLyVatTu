import axios from "axios";

const axiosClient = axios.create({
  // Đổi từ 127.0.0.1 thành localhost để khớp với cấu hình CORS ở Backend
  baseURL: "http://localhost:8081/api", 
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      if (user.role) {
        config.headers["X-Role"] = user.role;
        config.headers["X-User-Name"] = encodeURIComponent(user.hoTen || user.tenDangNhap || "Unknown");
      }
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

axiosClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error("API Error:", err);
    return Promise.reject(err);
  }
);

export default axiosClient;