import axiosClient from "./axiosClient";

const notificationApi = {
  getAll: () => axiosClient.get("notifications"),
  markRead: (id) => axiosClient.put(`notifications/${id}/read`),
  markAllRead: () => axiosClient.put("notifications/mark-all-read"),
};

export default notificationApi;
