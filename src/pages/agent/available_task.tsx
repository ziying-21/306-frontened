import { mapEntemplate2Zhtemplate, mapTag2Zh } from "@/const/interface";
import { downLoadZip, request } from "@/utils/network";
import { mapTemplate2Icon, transTime } from "@/utils/valid";
import Typography from "@mui/material/Typography";
import { Button, Descriptions, Divider, Form, Input, Modal, Select, Tag, Tooltip, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd/lib";
import { useEffect, useState } from "react";
import { AgentLabeler } from "./available_labeler";
import { SearchOutlined } from "@ant-design/icons";

interface AgentTaskInfo {
  task_id: number;
  create_at: number;
  deadline: number;
  title: string;
  batch_file: string;
  reward: number;
  time: number;
  labeler_number: number;
  demander_id: number;
  type: string;
  template: string;
}

const AgentAvailableTask = () => {
  const [tasks, setTasks] = useState<AgentTaskInfo[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [labelerLists, setLabelerLists] = useState<AgentLabeler[]>([]);
  const [distributeModalOpen, setDistributeModalOpen] = useState<boolean>(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [detail, setDetail] = useState<AgentTaskInfo>({
    task_id: 1,
    create_at: 198374982,
    deadline: 21342342134,
    title: "任务标题",
    batch_file: "",
    reward: 3,
    time: 5,
    labeler_number: 5,
    demander_id: 3,
    type: "intent",
    template: "TextClassification",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  const fetchList = async () => {
    request("/api/agent_acquire_labeler_list", "GET")
      .then((response) => {
        setLabelerLists(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取标注方列表失败，${error.response.data.message}`);
        } else {
          message.error("获取标注方列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  };
  useEffect(() => {
    request("/api/agent_distribute", "GET")
      .then((response) => {
        setTasks(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取可分发任务列表失败，${error.response.data.message}`);
        } else {
          message.error("获取可分发任务失败，网络错误");
        }
      });
    fetchList();
  }, [refreshing]);

  const distribute = async (task_id: number, labeler: string[]) => {
    request("/api/agent_distribute", "POST", {
      task_id: task_id,
      labeler: labeler,
    })
      .then(() => {
        message.success("派发成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`任务派发失败，${error.response.data.message}`);
        } else {
          message.error("任务派发失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const TasksTableColumns: ColumnsType<any> = [
    {
      title: "任务标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "30%",
      filterDropdown: ({ confirm }) => (
        <Input.Search placeholder="搜索任务标题" onChange={(e) => { setSearchTitle(e.target.value); confirm({ closeDropdown: false }) }} />
      ),
      filterIcon: (<SearchOutlined/>),
    },
    {
      title: "任务模板",
      dataIndex: "template",
      key: "template",
      align: "center",
      width: "30%",
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
          text: "乱序重排",
          value: "SentenceSort"
        },
        {
          text: "自定义模板",
          value: "Custom"
        }
      ],
      onFilter: (values, record) => record.template=== values,
      render: (template) => 
        <Tag color="blue" icon={mapTemplate2Icon(template)}>{mapEntemplate2Zhtemplate[template]}</Tag>
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="点击此处查看任务详情">
              <Button
                type="link"
                onClick={() => {
                  setDetail(record);
                  setDetailModalOpen(true);
                }}
              >
                查看
              </Button>
            </Tooltip>
            <Tooltip title="点击此处下载题目文件">
              <Button
                type="link"
                onClick={() => {
                  setLoading(true);
                  downLoadZip(record.batch_file, setLoading);
                }}
              >
                下载
              </Button>
            </Tooltip>
            <Tooltip title="点击此处进行任务分发">
              <Button
                type="link"
                onClick={() => {
                  setDetail(record);
                  setDistributeModalOpen(true);
                }}
              >
                分发
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];
  let filteredData = tasks;
  filteredData = tasks.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTitle.toLowerCase())
  )
  return (
    <>
      <Modal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        footer={null}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          任务详情
        </Typography>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="标题" span={4}>
            {detail.title}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={4}>
            {transTime(detail.create_at)}
          </Descriptions.Item>
          <Descriptions.Item label="截止时间" span={4}>
            {transTime(detail.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={2}>
            <Tag color="blue" icon={mapTemplate2Icon(detail.template)}>{mapEntemplate2Zhtemplate[detail.template]}</Tag>
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
          <Descriptions.Item label="任务标签" span={2}>
            <Tag color="cyan">{mapTag2Zh[detail.type]}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      <Modal
        open={distributeModalOpen}
        footer={null}
        onCancel={() => {
          setDistributeModalOpen(false);
        }}
        destroyOnClose
        maskClosable={false}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          分配任务
        </Typography>
        <Divider />
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true);
            distribute(detail.task_id, values.labeler);
            setDistributeModalOpen(false);
          }}
          autoComplete="off"
        >
          <p>作为中介，您可以将该委托给您的任务分发给标注方，请在下面选择您要分发的标注方的名字</p>
          <p>
            <b>注：</b>您可以在“可配发标注者”菜单下查看您可以配发的标注者
          </p>
          <Form.Item name="labeler" rules={[{ required: true, message: "不能为空" }]}>
            <Select
              size="large"
              showSearch
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="请选择要分配的标注方，支持搜索"
              options={labelerLists.map((labeler) => {
                return {
                  label: labeler.username,
                  value: labeler.username,
                };
              })}
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
        columns={TasksTableColumns}
        dataSource={filteredData}
        loading={refreshing || loading}
        pagination={{ pageSize: 8 }}
      />
    </>
  );
};

export default AgentAvailableTask;
