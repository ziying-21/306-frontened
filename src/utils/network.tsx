import { message } from "antd";
import axios, { AxiosResponse } from "axios";

const network = axios.create({
  baseURL: "",
});

export class NetworkError extends Error {
  response: AxiosResponse<any, any>;
  constructor(_response: AxiosResponse<any, any>) {
    super();
    this.response = _response;
  }
}

export const request = async (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any
) => {
  const response = await network.request({ method, url, data }).catch((err) => {
    /**
     * @note token expired 表明token已过期，需要跳转到登录界面
     */
    if ((err.response?.data as any).message === "Token Expired") {
      message.error("登录token已超时，请点击刷新后重新登录");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    throw new NetworkError(err.response);
  });
  if (response?.data.code === 0) {
    return { ...response };
  } else {
    throw new NetworkError(response?.data.info);
  }
};

/**
 * @brief Add the token to the Authorization header
 *
 */
network.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const downLoadZip = async (url: string, setRefreshing: any) => {
  axios
    .get(`/api/file?url=${url}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/zip" })
      );
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = "task.zip";
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    })
    .catch((error) => {
      message.error(`文件下载失败，${error.response.message}`);
    })
    .finally(() => {
      setRefreshing(false);
    });
};
