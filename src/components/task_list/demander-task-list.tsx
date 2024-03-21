import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Button,
  Space,
  Modal,
  Descriptions,
  Collapse,
  Tooltip,
  Popconfirm,
  message,
  Tag,
  Divider,
  Form,
  DatePicker,
  Input,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { mapTemplate2Icon, transTime } from "@/utils/valid";
import { Table } from "antd/lib";
import DataExportCallback from "@/components/data_export/dataExport";
import UpdateTask from "../task_manage/update-task";
import { mapEntemplate2Zhtemplate, mapState2ColorChinese, mapTag2Zh } from "@/const/interface";
import { request } from "../../utils/network";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { TextField } from "@mui/material";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";

export interface DemanderTaskTableEntry {
  task_id: number;
  create_at: number;
  deadline: number;
  title: string;
  state: string[];
  reward: number;
  time: number;
  labeler_number: number;
  labeler_id: number[];
  template: string;
  labeler_state: string[];
  pass_check: boolean;
  labeler_credits: number[];
  distribute: "system" | "agent";
  distribute_type: "order" | "smart";
  type: "sentiment" | "part-of-speech" | "intent" | "event";
  agent_username: string;
  priority: number;
}

interface DemanderTaskListProps {
  type: string | undefined;
}

const DemanderTaskList = (props: DemanderTaskListProps) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<DemanderTaskTableEntry[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [autoCheckingModalOpen, setAutoCheckingModalOpen] = useState<boolean>(false);
  const [detail, setDetail] = useState<DemanderTaskTableEntry>({
    task_id: -1,
    create_at: 0,
    deadline: 0,
    title: "标题五个字",
    state: [],
    labeler_number: 0,
    labeler_id: [],
    template: "TextClassification",
    labeler_state: [],
    pass_check: false,
    labeler_credits: [],
    reward: 0,
    time: 0,
    distribute: "agent",
    distribute_type: "order",
    type: "event",
    agent_username: "agent1",
    priority: 0,
  });
  const [redistributeModalOpen, setRedistributeModalOpen] = useState<boolean>(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const auto_check = async (task_id: number, credits: string, accuracy: string) => {
    request("/api/demander/auto_check", "POST", {
      task_id: task_id,
      credits: parseInt(credits),
      accuracy: parseInt(accuracy),
    })
      .then(() => {
        message.success("自动审核请求提交成功，请稍后查看结果");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`自动审核请求提交失败，${error.response.data.message}`);
        } else {
          message.error("自动审核请求提交失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      })
  };
  const delete_task = async (task_id: number) => {
    axios
      .delete(`/api/task`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        params: { task_id: task_id },
      })
      .then(() => {
        message.success("删除成功");
      })
      .catch((err) => {
        if (err.response) {
          message.error(`删除失败，${err.response.data.message}`);
        } else {
          message.error("删除失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const postRedistribute = async (task_id: number, deadline: number, reward: number) => {
    request("/api/demander/redistribute", "POST", {
      task_id: task_id,
      deadline: deadline,
      reward: reward,
    })
      .then(() => {
        message.success("重分发成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`举报处理失败，${error.response.data.message}`);
        } else {
          message.error("举报处理失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };
  const { Panel } = Collapse;
  const DemanderTaskTableColumns: ColumnsType<any> = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
      filterDropdown: ({ confirm }) => (
        <Input.Search placeholder="搜索任务标题" onChange={(e) => { setSearchTitle(e.target.value); confirm({ closeDropdown: false }) }} />
      ),
      filterIcon: (<SearchOutlined/>),
    },
    {
      title: "创建时间",
      dataIndex: "create_at",
      key: "create_at",
      align: "center",
      width: "20%",
      render: (timeStamp) => <p>{transTime(timeStamp)}</p>,
      sorter: (a, b) => a.create_at - b.create_at,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "任务状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      filterSearch: true,
      filters: [
        {
          text: "待管理员审核",
          value: "admin_checking",
        },
        {
          text: "分发中",
          value: "distributing",
        },
        {
          text: "标注中",
          value: "labeling",
        },
        {
          text: "待审核",
          value: "checking",
        },
        {
          text: "已完成",
          value: "completed",
        },
        {
          text: "已过期",
          value: "overdue",
        },
      ],
      onFilter: (values, record) => record.state.indexOf(values) !== -1,
      render: (state) => {
        return (
          <>
            {state.map((s: string, idx: number) => (
              <Tooltip title={mapState2ColorChinese[s]["show"]} key={idx}>
                <Tag color={mapState2ColorChinese[s]["color"]}>
                  {mapState2ColorChinese[s]["description"]}
                </Tag>
              </Tooltip>
            ))}
          </>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      width: "32%",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="点击此处查看任务基本信息">
              <Button
                type="link"
                onClick={() => {
                  setIsDetailModalOpen(true);
                  setDetail(record);
                }}
              >
                任务详情
              </Button>
            </Tooltip>
            <Tooltip title="点击此处查看任务基本信息">
              <Button
                type="link"
                onClick={() => {
                  router.push(`/demander/${record.task_id}`);
                }}
              >
                标注状况
              </Button>
            </Tooltip>
            <Tooltip title="点击此处进行自动审核，对待审核任务可用">
              <Button
                disabled = {record.state.indexOf("checking")===-1}
                type="link"
                onClick={() => {
                  setDetail(record);
                  setAutoCheckingModalOpen(true);
                }}
              >
                自动审核
              </Button>
            </Tooltip>
            <Tooltip title="点击此处导出标注数据，对已完成任务可用">
              <Popconfirm
                title="导出"
                okText="是"
                cancelText="否"
                description="是否归并数据后导出?"
                placement="bottom"
                disabled={record.state.indexOf("completed")===-1}
                onConfirm={() => {
                  setLoading(true);
                  DataExportCallback(record.task_id, true, setLoading);
                }}
                onCancel={() => {
                  setLoading(true);
                  DataExportCallback(record.task_id, false, setLoading);
                }}
              >
                <Button type="link"
                  disabled={record.state.indexOf("completed")===-1}
                >导出</Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="点击此处删除任务，请谨慎">
              <Button
                type="link"
                onClick={() => {
                  setLoading(true);
                  delete_task(record.task_id);
                }}
              >
                删除
              </Button>
            </Tooltip>
            <Tooltip title="过期任务可以重新分发">
              <Button
                type="link"
                onClick={() => {
                  setDetail(record);
                  setRedistributeModalOpen(true);
                }}
                disabled={record.state.indexOf("overdue")===-1||record.state.indexOf("completed")!==-1}
              >
                重分发
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    request(`/api/task${props.type ? "?state=" + props.type : ""}`, "GET")
      .then((response) => {
        const newTasks = response.data.demander_tasks.map((task: any) => {
          return { ...task };
        });
        setTasks(newTasks);
      })
      .catch((err) => {
        console.log(err.reponse?.data);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [router, refreshing]);

  let filteredData = tasks;
  filteredData = tasks.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTitle.toLowerCase())
  )
  return (
    <>
      <Modal
        open={autoCheckingModalOpen}
        onCancel={() => {
          setAutoCheckingModalOpen(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          自动审核
        </Typography>
        <Divider></Divider>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true);
            auto_check(detail.task_id, values.credits, values.accuracy);
            setAutoCheckingModalOpen(false);
          }}
        >
          <p>我们将根据您创建任务时上传的带标注数据对标注方的标注进行自动审核。</p>
          <p>
            <b>注：</b>
            为了审核结果的可靠性，请您在自动审核时指定一个信用分标准，对于信用分低于此标准的标注者，我们不会进行自动审核。
          </p>
          <p>如果您不想考虑信用分，希望对所有标注方都进行自动审核，请将该标准设置为0。</p>
          <Form.Item
            name="credits"
            rules={[
              { required: true, message: "不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error("信用分标准不能为负数"));
                  }
                  if (value > 100) {
                    return Promise.reject(new Error("信用分标准不能超过100"));
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
              label="信用分标准"
              autoFocus
              type="number"
            />
          </Form.Item>
          <p>您还需要指定正确率标准，高于此标准的标注将会通过审核，否则不通过审核。</p>
          <Form.Item
            name="accuracy"
            rules={[
              { required: true, message: "不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error("正确率标准不能为负数"));
                  }
                  if (value > 100) {
                    return Promise.reject(new Error("正确率标准不能超过100"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextField
              name="accuracy"
              fullWidth
              id="accuracy"
              label="正确率标准"
              autoFocus
              type="number"
            />
          </Form.Item>
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
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
        }}
        footer={null}
        width={"60%"}
        destroyOnClose
        centered
      >
        {detail.pass_check ? <></> : <Alert severity="warning">该任务尚未通过管理员审核</Alert>}
        <h3>任务详情</h3>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="标题" span={4}>
            {detail.title}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {transTime(detail.create_at)}
          </Descriptions.Item>
          <Descriptions.Item label="截止时间" span={2}>
            {transTime(detail.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={2}>
            <Tag color="blue" icon={mapTemplate2Icon(detail.template)}>{mapEntemplate2Zhtemplate[detail.template]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态" span={2}>
            <Space size={[0, 8]} wrap>
              {detail.state.map((s: string, idx: number) => (
                <Tag color={mapState2ColorChinese[s].color} key={idx}>
                  {mapState2ColorChinese[s].description}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="要求标注方人数" span={2}>
            {detail.labeler_number}
          </Descriptions.Item>
          <Descriptions.Item label="任务奖励" span={2}>
            {detail.reward}
          </Descriptions.Item>
          <Descriptions.Item label="单题限时" span={2}>
            {detail.time}秒
          </Descriptions.Item>
          <Descriptions.Item label="分发方式" span={2}>
            {detail.distribute === "system"
              ? detail.distribute_type === "order"
                ? "系统-顺序分发"
                : "系统-智能分发"
              : "中介: " + detail.agent_username}
          </Descriptions.Item>
          <Descriptions.Item label="类型标签" span={2}>
            <Tag color="cyan">{detail.type ? mapTag2Zh[detail.type] : "暂无标签"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="任务优先级" span={2}>
            {detail.priority}
          </Descriptions.Item>
        </Descriptions>
        <h3>修改任务</h3>
        <Collapse>
          <Panel key={""} header={"点击此处展开详情，未分发的任务可以修改任务配置和题目"}>
            <UpdateTask taskId={detail.task_id} />
          </Panel>
        </Collapse>
      </Modal>
      <Modal
        open={redistributeModalOpen}
        footer={null}
        onCancel={() => {
          setRedistributeModalOpen(false);
        }}
        destroyOnClose
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          过期任务重分发
        </Typography>
        <Divider></Divider>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true);
            const deadline = (values.deadline as unknown as dayjs.Dayjs).valueOf();
            postRedistribute(detail.task_id, deadline, values.reward);
            setRedistributeModalOpen(false);
          }}
        >
          <p>对于过期任务，如果现有的标注结果不能让您满意，您可以选择重新分发此任务</p>
          <p>如果您认为是因为截止时间过早导致任务过期，您可以重新选择设置截止日期</p>
          <Form.Item name="deadline" rules={[{ required: true, message: "不能为空" }]}>
            <DatePicker
              inputReadOnly
              showTime
              disabledDate={(date) => date.valueOf() < dayjs().valueOf()}
            />
          </Form.Item>
          <p>如果您认为是给出的标注奖励不够吸引人，可以重新设置任务奖励</p>
          <Form.Item
            name="reward"
            rules={[
              { required: true, message: "不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error("奖励不能为负数"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextField
              name="reward"
              fullWidth
              id="reward"
              label="任务奖励"
              autoFocus
              type="number"
            />
          </Form.Item>
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
      <Table
        columns={DemanderTaskTableColumns}
        dataSource={filteredData}
        loading={refreshing || loading}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
};

export default DemanderTaskList;
