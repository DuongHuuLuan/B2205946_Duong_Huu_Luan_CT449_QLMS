import axios from "axios";

const commonConfig = {
  headers: {
    Accept: "application/json",
  },
};

export default (baseURL) => {
  const apiClient = axios.create({
    baseURL,
    ...commonConfig,
  });

  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("userToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiClient;
};
