import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import React from "react";
import { message } from "antd";
import axios from "axios";

/**
 * 创建任务组件
 * @returns 创建任务组件
 */
const CreateTask: React.FC = () => {
  const onFinish = (info: TaskInfo): Promise<void> =>
    new Promise((resolve, reject) => {
      axios
        .post(
          "/api/task",
          { ...info, create_at: new Date().valueOf() },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        )
        .then((value) => {
          if (value.data.code === 0) {
            message.success("发布成功");
            resolve();
          } else message.error(value.data.reason);
        })
        .catch((reason) => {
          console.log(reason);
          message.error(`网络错误 ${reason?.response?.data?.message}`);
          reject();
        });
    });

  return <TaskInfoForm taskInfo={{} as TaskInfo} onFinish={(info: TaskInfo) => onFinish(info)} />;
};

export default CreateTask;
