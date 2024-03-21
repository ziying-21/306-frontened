import { mapEntemplate2Zhtemplate, TaskInfo } from "@/const/interface";
import { Button, Descriptions, Divider, Form, Input, message, Modal, Tag, Tooltip } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd/lib";
import { mapTemplate2Icon, transTime } from "@/utils/valid";
import { downLoadZip, request } from "@/utils/network";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SearchOutlined } from "@ant-design/icons";

const AdministratorCheckTask = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [taskId, setTaskId] = useState<number>(-1);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState<boolean>(false);
  const [denyModalOpen, setDenyModalOpen] = useState<boolean>(false);
  const [taskDetail, setTaskDetail] = useState<TaskInfo>({
    task_id: -1,
    title: "标题五个字",
    create_at: 0,
    deadline: 0,
    template: "TextClassification",
    reward: 0,
    time: 0,
    labeler_number: 0,
    demander_id: -1,
    task_data: [],
    batch: false,
    type: "event",
    distribute: "system",
    agent_username: "中介名称五个字",
    priority: 0,
  });
  const [searchTitle, setSearchTitle] = useState<string>("");
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    request("/api/undistribute", "GET")
      .then((response) => {
        const newTasks = response.data.tasks;
        setTasks(newTasks);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取需求方权限申请失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [router, refreshing]);

  const postCheckTask = async (
    _task_id: number,
    _result: boolean,
    _credits: number,
    _message: string
  ) => {
    request("/api/audit_result", "POST", {
      task_id: _task_id,
      result: _result,
      credits: _credits,
      message: _message,
    })
      .then(() => {
        message.success("审核结果提交成功");
        setDenyModalOpen(false);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`审核结果提交失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };
  const columns: ColumnsType<any> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      filterDropdown: () => (
        <Input.Search placeholder="搜索任务标题" onChange={(e) => {setSearchTitle(e.target.value)}}/>
      ),
      filterIcon: <SearchOutlined/>
    },
    {
      title: "模板",
      dataIndex: "template",
      key: "template",
      align: "center",
      filterSearch: true,
      width: "25%",
      filters: [
        {
          text: "文本分类",
          value: "TextClassification",
        },
        {
          text: "图片分类",
          value: "ImagesClassification",
        },
        {
          text: "骨骼打点",
          value: "FaceTag",
        },
        {
          text: "图片框选",
          value: "ImageFrame",
        },
        {
          text: "音频标注",
          value: "SoundTag",
        },
        {
          text: "视频标注",
          value: "VideoTag",
        },
        {
          text: "文字三元组",
          value: "TextTriple"
        },
        {
          text: "文本审核",
          value: "TextReview"
        },
        {
          text: "音频审核",
          value: "AudioReview"
        },
        {
          text: "视频审核",
          value: "VideoReview"
        },
        {
          text: "图片审核",
          value: "ImageReview"
        },
        {
          text: "自定义模板",
          value: "Custom"
        }
      ],
      onFilter: (values, record) => record.template.indexOf(values) !== -1,
      render: (_, record) => <Tag color="blue" icon={mapTemplate2Icon(record.template)}>{mapEntemplate2Zhtemplate[record.template]}</Tag>,
    },
    {
      title: "查看与审核",
      key: "action",
      align: "center",
      width: "40%",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => {
              setTaskDetail(record);
              setTaskDetailModalOpen(true);
            }}>
            任务详情
          </Button>
          <Tooltip title="点击此处下载题目文件">
            <Button
              type="link"
              onClick={() => {
                setLoading(true);
                downLoadZip(record.batch_file, setLoading);
              }}
            >
              下载数据
          </Button>
          </Tooltip>
          <Button
            type="link"
            onClick={() => {
              setLoading(true);
              postCheckTask(record.task_id, true, 0, "");
            }}
          >
            通过
          </Button>
          <Button
            type="link"
            onClick={() => {
              setTaskId(record.task_id);
              setDenyModalOpen(true);
            }}
          >
            不通过
          </Button>
        </>
      ),
    },
  ];

  let filteredData = tasks
  filteredData = tasks.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTitle.toLowerCase())
  )
  return (
    <>
      <Modal
        open={denyModalOpen}
        footer={null}
        onCancel={() => setDenyModalOpen(false)}
        destroyOnClose
      >
        <Typography component="h1" variant="h5">
          扣除信用分和原因说明
        </Typography>
        <Divider></Divider>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true);
            postCheckTask(taskId, false, values.credits, values.message);
            setDenyModalOpen(false);
          }}
          autoComplete="off"
        >
          <Grid item xs={24} sm={12}>
            <p>管理员可以对审核不通过的任务扣除信用分</p>
            <Form.Item
              name="credits"
              rules={[
                { required: true, message: "不能为空" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value < 0) {
                      return Promise.reject(new Error("扣除的信用分不能为负数"));
                    }
                    if (value > 100) {
                      return Promise.reject(new Error("扣除的信用分不能超过100"));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TextField
                name="credits"
                fullWidth
                id="credits"
                label="扣除的信用分"
                autoFocus
                type="number"
              />
            </Form.Item>
            <p>管理员需要对审核不通过的原因进行说明</p>
            <Form.Item name="message" rules={[{ required: true, message: "原因不能为空" }]}>
              <TextField
                name="message"
                fullWidth
                id="message"
                label="原因说明"
                autoFocus
                type="message"
                multiline
              />
            </Form.Item>
          </Grid>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{
              backgroundColor: "#3b5999",
              marginBottom: "5px",
            }}
          >
            确认
          </Button>
        </Form>
      </Modal>
      <Modal
        open={taskDetailModalOpen}
        onCancel={() => setTaskDetailModalOpen(false)}
        footer={null}
        width={"60%"}
        centered
        destroyOnClose
      >
        <>
          <h3>基本信息</h3>
          <Descriptions bordered column={4}>
            <Descriptions.Item label="标题" span={4}>
              {taskDetail.title}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {transTime(taskDetail.create_at)}
            </Descriptions.Item>
            <Descriptions.Item label="截止时间" span={2}>
              {transTime(taskDetail.deadline)}
            </Descriptions.Item>
            <Descriptions.Item label="创建人ID" span={2}>
              {taskDetail.demander_id}
            </Descriptions.Item>
            <Descriptions.Item label="模板" span={2}>
              <Tag color="blue" icon={mapTemplate2Icon(taskDetail.template)}>{mapEntemplate2Zhtemplate[taskDetail.template]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="任务奖励" span={2}>
              {taskDetail.reward}
            </Descriptions.Item>
            <Descriptions.Item label="单题限时" span={2}>
              {taskDetail.time}秒
            </Descriptions.Item>
            <Descriptions.Item label="标注者人数" span={2}>
              {taskDetail.labeler_number}
            </Descriptions.Item>
            <Descriptions.Item label="标注者人数" span={2}>
              {taskDetail.labeler_number}
            </Descriptions.Item>
            <Descriptions.Item label="分发方式" span={4}>
              {taskDetail.distribute === "agent"
                ? `中介: ${taskDetail.agent_username}`
                : taskDetail.distribute_type === "smart"
                ? "系统-智能"
                : "系统-顺序"}
            </Descriptions.Item>
            <Descriptions.Item label="任务优先级" span={2}>
              {taskDetail.priority}
            </Descriptions.Item>
          </Descriptions>
        </>
      </Modal>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={refreshing || loading}
        pagination={{ pageSize: 6 }}
      />
    </>
  );
};

export default AdministratorCheckTask;

/**
 * 待管理员审核(admin_checking)：任务创建之后，管理员审核之前
 * 分发中(distributing)：管理员审核之后，接受任务的标注方数量尚未达到需求方要求
 * 标注中(labeling)：已经有任意数量的标注方接受任务，但存在没有完成标注的标注方
 * 待审核(checking)：存在已完成标注但还没有审核的标注方
 * 已完成(completed)：通过审核的标注方数量达到需求方的要求
 * 已过期(overdue)：已过ddl
 */
