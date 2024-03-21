import TaskInfoForm from "./task-info-form";
import { TaskInfo } from "@/const/interface";
import { useEffect, useState } from "react";
import React from "react";
import { message, Spin } from "antd";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";

/**
 * 更新任务组件
 * @param taskId 任务id
 * @returns 更新任务组件
 */
const UpdateTask: React.FC<{ taskId: number }> = (props) => {
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({} as TaskInfo);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    axios
      .get("/api/demander/task", {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        params: { task_id: props.taskId },
      })
      .then((value) => {
        if (value.data.code === 0) {
          setTaskInfo(value.data.data);
        } else {
          message.error("获取数据失败");
        }
      })
      .catch((reason) => {
        console.log(reason);
        message.error("获取数据失败");
      })
      .finally(() => setLoading(false));
  }, [router, props.taskId]);

  /**
   * 更新任务信息
   * @param info 任务信息
   */
  const onFinish = (info: TaskInfo): Promise<void> =>
    new Promise((resolve, reject) => {
      setLoading(true);
      axios
        .put(
          "/api/task",
          { ...info, create_at: new Date().valueOf(), task_id: props.taskId },
          {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
          }
        )
        .then((value) => {
          if (value.data.code === 0) {
            console.log("更新成功");
            resolve();
          } else message.error("更新失败");
        })
        .catch((reason: AxiosError) => {
          console.log(reason);
          message.error(`网络错误 ${(reason.response?.data as any)?.message}`);
          reject();
        })
        .finally(() => setLoading(false));
    });

  return loading ? (
    <Spin tip="加载中" />
  ) : (
    <TaskInfoForm taskInfo={taskInfo} onFinish={(info) => onFinish(info)} />
  );
};

export default UpdateTask;
