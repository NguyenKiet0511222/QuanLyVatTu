import axiosClient from "./axiosClient";

const activityLogApi = {
  getAll: () => axiosClient.get("activity-logs"),
};

export default activityLogApi;
