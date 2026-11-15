import axiosClient from "./axiosClient";

const borrowApi = {
  getAll: () => axiosClient.get("borrows"),
  getById: (id) => axiosClient.get(`borrows/${id}`),
  create: (data) => axiosClient.post("borrows", data),
  approve: (id) => axiosClient.put(`borrows/${id}/approve`),
  reject: (id, data) => axiosClient.put(`borrows/${id}/reject`, data),
  handover: (id, data) => axiosClient.put(`borrows/${id}/handover`, data || {}),
  returnDevice: (id, data) => axiosClient.put(`borrows/${id}/return`, data || {}),
  update: (id, data) => axiosClient.put(`borrows/${id}`, data),
  delete: (id) => axiosClient.delete(`borrows/${id}`),
};

export default borrowApi;
