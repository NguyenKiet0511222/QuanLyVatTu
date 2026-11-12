import axiosClient from "./axiosClient";

const nguoiMuonApi = {
  getAll: () => axiosClient.get("nguoi-muon"),
  getById: (id) => axiosClient.get(`nguoi-muon/${id}`),
  create: (data) => axiosClient.post("nguoi-muon", data),
  update: (id, data) => axiosClient.put(`nguoi-muon/${id}`, data),
  delete: (id) => axiosClient.delete(`nguoi-muon/${id}`),
};

export default nguoiMuonApi;
