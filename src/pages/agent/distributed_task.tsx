import { ColumnsType } from "antd/es/table";
import { Button, Descriptions, Divider, Input, Modal, Table, Tag, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import { downLoadZip, request } from "@/utils/network";
import { mapEntemplate2Zhtemplate, mapState2ColorChinese } from "@/const/interface";
import { mapTemplate2Icon, transTime } from "@/utils/valid";
import { SearchOutlined } from "@ant-design/icons";

interface task {
  title: string;
  create_at: number;
  deadline: number;
  reward: number;
  labeler_number: number;
  template: string;
  demander_id: number;
  labeler_id: number[];
  labeler_state: number[];
  state: string;
}

const AgentDistributedTask = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [taskList, setTaskList] = useState<task[]>([]);
  const [detail, setDetail] = useState<task>({
    title: "",
    create_at: 0,
    deadline: 0,
    reward: 0,
    labeler_number: 0,
    template: "TextClassification",
    demander_id: 0,
    labeler_id: [],
    labeler_state: [],
    state: "labeling",
  });
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [labelerModalOpen, setLabelerModalOpen] = useState<boolean>(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  useEffect(() => {
    request("/api/agent/distributed", "GET")
      .then((response) => {
        setTaskList(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取任务列表失败，${error.response.data.message}`);
        } else {
          message.error("获取任务列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);
  const TaskListColumns: ColumnsType<any> = [
    {
      title: "任务标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
      filterDropdown: () => (
        <Input.Search placeholder="搜索标注方用户名" onChange={(e) => {setSearchTitle(e.target.value)}}/>
      ),
      filterIcon: (<SearchOutlined/>),
    },
    {
      title: "任务模板",
      dataIndex: "template",
      key: "template",
      align: "center",
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
          text: "乱序重排",
          value: "SentenceSort"
        },
        {
          text: "自定义模板",
          value: "Custom"
        }
      ],
      onFilter: (values, record) => record.template=== values,
      render: (template) => (
        <>
          <Tag icon={mapTemplate2Icon(template)} color="blue">{mapEntemplate2Zhtemplate[template]}</Tag>
        </>
      ),
    },
    {
      title: "任务状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      width: "25%",
      filters: [
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
      render: (states) => (
        states.map((state: string, idx: number) => (
          <Tooltip title={mapState2ColorChinese[state].show} key={idx}>
            <Tag color={mapState2ColorChinese[state]["color"]}>
              {mapState2ColorChinese[state]["description"]}
            </Tag>
          </Tooltip>
        ))

      ),
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              downLoadZip(record.batch_file, setLoading);
            }}
            type="link"
          >
            下载
          </Button>
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setDetailModalOpen(true);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setLabelerModalOpen(true);
            }}
          >
            标注者
          </Button>
        </>
      ),
    },
  ];
  const LabelerTableColumn: ColumnsType<any> = [
    {
      title: "标注者ID",
      dataIndex: "labeler_id",
      key: "labeler_id",
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      render: (state) => (
        <Tooltip title={mapState2ColorChinese[state].show}>
          <Tag color={mapState2ColorChinese[state].color}>
            {mapState2ColorChinese[state].description}
          </Tag>
        </Tooltip>
      ),
    },
  ];
  let filteredData = taskList;
  filteredData = taskList.filter(
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
        <h3 style={{ textAlign: "center" }}>任务详情</h3>
        <Divider />
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
          <Descriptions.Item label="奖励" span={2}>
            {detail.reward}
          </Descriptions.Item>
          <Descriptions.Item label="标注人数" span={2}>
            {detail.labeler_number}
          </Descriptions.Item>
          <Descriptions.Item label="发布者ID" span={4}>
            {detail.demander_id}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={4}>
            <Tag color="blue" icon={mapTemplate2Icon(detail.template)}>{mapEntemplate2Zhtemplate[detail.template]}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Modal
        open={labelerModalOpen}
        footer={null}
        onCancel={() => {
          setLabelerModalOpen(false);
        }}
      >
        <h3 style={{ textAlign: "center" }}>标注者详情</h3>
        <Table
          columns={LabelerTableColumn}
          dataSource={detail.labeler_id.map((id: number, idx: number) => {
            return {
              labeler_id: id,
              state: detail.labeler_state[idx],
            };
          })}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
      <Table columns={TaskListColumns} loading={refreshing || loading} dataSource={filteredData} />
    </>
  );
};

export default AgentDistributedTask;
