import axiosClient from "./axiosClient";

const borrowApi = {
  getAll: () => axiosClient.get("borrows"),
  getById: (id) => axiosClient.get(`borrows/${id}`),
  create: (data) => axiosClient.post("borrows", data),
  update: (id, data) => axiosClient.put(`borrows/${id}`, data),
  delete: (id) => axiosClient.delete(`borrows/${id}`),
};

export default borrowApi;
