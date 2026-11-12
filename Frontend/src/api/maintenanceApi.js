import axiosClient from "./axiosClient";

const maintenanceApi = {
  getAll: () => axiosClient.get("maintenance"),
  create: (data) => axiosClient.post("maintenance", data),
  updateStatus: (id, status) => axiosClient.put(`maintenance/${id}/status?status=${status}`),
};

export default maintenanceApi;
