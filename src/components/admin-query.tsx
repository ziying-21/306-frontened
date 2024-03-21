import { request } from "@/utils/network";
import { Button, Divider, InputNumber, Spin, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import Problem from "./demander_problem/problem";
import Grid from "@mui/material/Grid";

interface AdminQueryProps {
  task_id: number;
  labeler_id: number;
}

const AdminQuery = (props: AdminQueryProps) => {
  const [loading, setloading] = useState<boolean>(true);
  const [taskData, setTaskData] = useState<any[]>([]);
  const [problemIndex, setProblemIndex] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  useEffect(() => {
    request(`/api/admin/query?task_id=${props.task_id}&labeler_id=${props.labeler_id}`, "GET")
      .then((response) => {
        setTaskData(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取标注信息失败，${error.response.data.message}`);
        } else {
          message.error("获取标注信息失败，网络错误");
        }
      })
      .finally(() => {
        setloading(false);
      });
  }, [loading, props.labeler_id, props.task_id]);
  return loading ? (
    <Spin spinning={loading} tip="题目信息加载中，请稍后..." />
  ) : (
    <>
      <Problem
        key={problemIndex}
        problem={taskData[problemIndex]}
        index={problemIndex}
        total={taskData.length}
      />
      <Divider />
      <Grid container>
        <Grid item xs>
          <Tooltip title={problemIndex === 0 ? "已经是第一题了" : undefined}>
            <Button
              disabled={problemIndex === 0}
              onClick={() => {
                setProblemIndex((i) => i - 1);
              }}
            >
              上一题
            </Button>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title={problemIndex === taskData.length - 1 ? "已经是最后一题了" : undefined}>
            <Button
              disabled={problemIndex === taskData.length - 1}
              onClick={() => {
                setProblemIndex((i) => i + 1);
              }}
            >
              下一题
            </Button>
          </Tooltip>
          <Divider type="vertical" />
        </Grid>
        <Grid>
          <Button
            type="link"
            onClick={() => {
              if (pageNumber !== null) {
                if (pageNumber <= taskData.length && pageNumber >= 1) {
                  setProblemIndex(pageNumber - 1);
                } else {
                  message.warning(`请输入正确的题目序号1~${taskData.length}`);
                }
              }
            }}
          >
            跳转至
          </Button>
          <InputNumber
            size="small"
            placeholder={`跳转至`}
            value={pageNumber}
            onChange={(e) => {
              setPageNumber(e);
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AdminQuery;
