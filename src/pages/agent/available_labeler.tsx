import { mapLevel2Zh, mapTag2Zh } from "@/const/interface";
import { request } from "@/utils/network";
import { SearchOutlined } from "@ant-design/icons";
import Typography from "@mui/material/Typography";
import { Button, Descriptions, Divider, Input, Modal, Table, Tag, Tooltip, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

export interface AgentLabeler {
  username: string;
  points: number;
  level: "bronze" | "silver" | "gold" | "diamond";
  exp: number;
  credits: number;
  prefer: string;
  is_vip: boolean;
  is_blocked: boolean;
}

const AgentAvailableLabeler = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [labelerLists, setLabelerLists] = useState<AgentLabeler[]>([]);
  const [detail, setDetail] = useState<AgentLabeler>({
    username: "",
    points: 0,
    level: "bronze",
    exp: 0,
    credits: 0,
    prefer: "intent",
    is_vip: false,
    is_blocked: false,
  });
  const [LabelerModalOpen, setLabelerModalOpen] = useState<boolean>(false);
  const [searchName, setSearchName] = useState<string>("");

  useEffect(() => {
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
  }, [refreshing]);
  const LabelerTableColumns: ColumnsType<any> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      width: "20%",
      filterDropdown: () => (
        <Input.Search placeholder="搜索标注方用户名" onChange={(e) => {setSearchName(e.target.value)}}/>
      ),
      filterIcon: (<SearchOutlined/>),
      render: (name, record) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setLabelerModalOpen(true);
            }}
          >
            {name}
          </Button>
        );
      },
    },
    {
      title: "偏好设置",
      dataIndex: "prefer",
      key: "prefer",
      align: "center",
      render: (prefer) => <Tag color="cyan">{prefer ? mapTag2Zh[prefer] : "暂无偏好"}</Tag>,
      filters: [
        {
          text: "词性分类",
          value: "part-of-speech",
        },
        {
          text: "情感分类/分析",
          value: "sentiment",
        },
        {
          text: "意图揣测",
          value: "intent",
        },
        {
          text: "事件概括",
          value: "event",
        },
      ],
      onFilter: (values, record) => record.prefer === values,
    },
    {
      title: "信用分",
      dataIndex: "credits",
      key: "credits",
      align: "center",
      width: "15%",
      render: (credits) => {
        return (
          <>
            <Tooltip
              title={
                credits > 90
                  ? "该标注方信用分十分良好，推荐选择"
                  : credits < 80
                  ? "该标注方信用分不佳，请谨慎选择"
                  : "该标注方的信用分为一般水平"
              }
            >
              <Tag color={credits > 90 ? "green" : credits < 80 ? "red" : "orange"}>{credits}</Tag>
            </Tooltip>
          </>
        );
      },
      sorter: (a, b) => a.credits - b.credits,
    },
    {
      title: "等级",
      dataIndex: "level",
      key: "level",
      align: "center",
      width: "20%",
      filters: [
        {
          text: "青铜",
          value: "bronze",
        },
        {
          text: "白银",
          value: "silver",
        },
        {
          text: "黄金",
          value: "gold",
        },
        {
          text: "钻石",
          value: "diamond",
        },
      ],
      onFilter: (values, record) => record.level === values,
      render: (level) => (
        <Tag color={mapLevel2Zh[level]["color"]}>{mapLevel2Zh[level]["name"]}</Tag>
      ),
    },
    {
      title: "状态",
      width: "20%",
      dataIndex: "is_blocked",
      key: "is_blocked",
      align: "center",
      render: (is_blocked) => {
        return is_blocked ? (
          <Tag color="rgb(252, 61, 14)">已封禁</Tag>
        ) : (
          <Tag color="rgb(33, 198, 39)">正常</Tag>
        );
      },
    },
  ];

  let filteredData = labelerLists;
  filteredData = labelerLists.filter(
    (announcement) =>
      announcement.username.toLowerCase().includes(searchName.toLowerCase())
  )
  return (
    <>
      <Modal
        open={LabelerModalOpen}
        onCancel={() => {
          setLabelerModalOpen(false);
        }}
        footer={null}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          标注方详情
        </Typography>
        <Divider />
        <Descriptions bordered column={4}>
          <Descriptions.Item label="用户名" span={4}>
            {detail.username}
          </Descriptions.Item>
          <Descriptions.Item label="等级" span={4}>
            <Tag color={mapLevel2Zh[detail.level]["color"]}>
              {mapLevel2Zh[detail.level]["name"]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="经验" span={2}>
            {detail.exp}
          </Descriptions.Item>
          <Descriptions.Item label="信用分" span={2}>
            {detail.credits}
          </Descriptions.Item>
          <Descriptions.Item label="会员权限" span={4}>
            {detail.is_vip ? "有" : "无"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Table
        columns={LabelerTableColumns}
        dataSource={filteredData}
        loading={refreshing}
        pagination={{ pageSize: 7 }}
      />
    </>
  );
};

export default AgentAvailableLabeler;
