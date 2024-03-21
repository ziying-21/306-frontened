import { mapLevel2Zh } from "@/const/interface";
import { request } from "@/utils/network";
import { SearchOutlined } from "@ant-design/icons";
import { Input, message, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

interface Agent {
  username: string,
  level: string,
  point: number,
  credits: number,
  exp: number
}

const DemanderAgentList = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  useEffect(() => {
    request("/api/get_agent", "GET")
      .then((reponse) => {
        setAgents(reponse.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取举报列表失败，${error.response.data.message}`);
        } else {
          message.error("获取举报列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);

  const AgentTableColumns: ColumnsType<any> = [
    {
      title: "中介用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      width: "20%",
      filterIcon: (<SearchOutlined/>),
      filterDropdown: () => (
        <Input.Search placeholder="搜索中介" onChange={(e) => {setSearchName(e.target.value)}}/>
      ),
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
      title: "积分",
      dataIndex: "points",
      key: "points",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.point - b.point,
    },
    {
      title: "经验",
      dataIndex: "exp",
      key: "exp",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.exp - b.exp,
    },
    {
      title: "信用分",
      dataIndex: "credits",
      key: "credits",
      align: "center",
      width: "20%",
      render:(credits) => (
        <Tag color={credits>90?"green":(credits<80?"red":"orange")}>{credits}</Tag>
      ),
      sorter: (a, b) => a.credits - b.credits,
    },
  ];

  let filteredData = agents;
  filteredData = agents.filter(
    (announcement) =>
      announcement.username.toLowerCase().includes(searchName.toLowerCase())
  )
  return (
    <Table
      columns={AgentTableColumns}
      loading={refreshing}
      dataSource={filteredData}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default DemanderAgentList;
