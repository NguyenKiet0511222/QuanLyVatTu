import axiosClient from "./axiosClient";

const maintenanceApi = {
  getAll: () => axiosClient.get("maintenance"),
  create: (data) => axiosClient.post("maintenance", data),
  updateProgress: (id, data) => axiosClient.put(`maintenance/${id}/progress`, data),
  inspect: (id, data) => axiosClient.put(`maintenance/${id}/inspect`, data),
  updateStatus: (id, status) => axiosClient.put(`maintenance/${id}/status?status=${status}`),
};

export default maintenanceApi;
