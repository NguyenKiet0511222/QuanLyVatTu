import axiosClient from "./axiosClient";

const deviceApi = {
  getAll: () => axiosClient.get("devices"),
  getById: (id) => axiosClient.get(`devices/${id}`),
  create: (data) => axiosClient.post("devices", data),
  update: (id, data) => axiosClient.put(`devices/${id}`, data),
  delete: (id) => axiosClient.delete(`devices/${id}`),
};

export default deviceApi;
