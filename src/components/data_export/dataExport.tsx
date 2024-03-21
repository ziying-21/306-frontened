import { message } from "antd";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";

const DataExportCallback = (taskId: number, merge: boolean, setLoading: Dispatch<SetStateAction<boolean>>): Promise<void> => 
  new Promise((resolve, reject) => {
    axios.get("/api/data", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { task_id: taskId, merge },
    })
      .then((value) => {
        const jsonData = JSON.stringify(value.data.tag_data);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = "data.json";
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      })
      .catch((reason) => {
        message.error(reason.response?.data?.message)
        reject();
      })
      .finally(() => {
        setLoading(false);
      })
  });
 
export default DataExportCallback;
