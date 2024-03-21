import React, { useState, useEffect } from "react";
import {
  Table,
  Checkbox,
  Select,
  Input,
  Space,
  Typography,
  Modal,
  Tag,
  message,
  Button,
  Divider,
  Spin,
  Card,
} from "antd";
import axios from "axios";
import { Announcement, Label, mapLabel } from "@/const/interface";
import { 
  LockOutlined,
  ToolOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  StarFilled
} from "@ant-design/icons";
import styles from './MyInput.module.css'; 
import { ColumnsType } from "antd/es/table";
import { transTime } from "@/utils/valid";

const { Title } = Typography;
const { Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
interface AnnouncementListProps {
  isAdmin: boolean;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({ isAdmin }) => {
  const sampleAnnouncements = [
    {
      admin_name: "Admin1",
      key: true,
      label: Label.Update,
      text: "这是一项更新公告，详情请点击标题查看。",
      time: Date.now(),
      title: "系统更新公告",
    },
    {
      admin_name: "Admin2",
      key: false,
      label: Label.Maintain,
      text: "这是一项维护公告，详情请点击标题查看。",
      time: Date.now() - 100000,
      title: "系统维护公告",
    },
    {
      admin_name: "Admin3",
      key: true,
      label: Label.Block,
      text: "这是一项封禁公告，详情请点击标题查看。",
      time: Date.now() - 200000,
      title: "封禁公告",
    },
    {
      admin_name: "Admin4",
      key: false,
      label: Label.Other,
      text: "这是一项其他公告，详情请点击标题查看。",
      time: Date.now() - 300000,
      title: "其他公告",
    },
  ];

  const [data, setData] = useState<Array<Announcement>>([]); // list
  const [loading, setLoading] = useState<boolean>(false);
  const [editable, setEditable] = useState<boolean>(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement>(() => {
    return {
      admin_name: "",
      key: false,
      label: Label.Other,
      text: "",
      time: Date.now(),
      title: "",
    };
  });
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>(() => {
    return {
      admin_name: "",
      key: false,
      label: Label.Other,
      text: "",
      time: Date.now(),
      title: "",
    };
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("time");
  const [label, setLabel] = useState<Label>(Label.All);
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false); // New modal open state
  const disabledStyle = !editable ? { color: "rgba(0, 0, 0, 0.85)", background: '#fff' } : {};

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 获取最新列表
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("/api/announcement", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setData(response.data.announce_list);
        // message.success("更新公告列表");
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("获取公告列表更新失败");
        setLoading(false);
      });
  };

  const handleUpload = () => {
    // 上传新创建公告
    Modal.confirm({
      title: "确认发布新公告",
      content: "你确定要发布新公告吗？",
      onOk: handleConfirmedUpload,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedUpload = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .post("/api/announcement", newAnnouncement, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        message.success("已发布！");
        setNewAnnouncement({
          admin_name: "",
          key: false,
          label: Label.Other,
          text: "",
          time: Date.now(),
          title: "",
        });
        fetchData();
        setLoading(false);
        setIsNewAnnouncementModalOpen(false);
        Modal.destroyAll();
      })
      .catch((error) => {
        console.error(error);
        message.error("发布失败");
        setLoading(false);
      });
  };

  const handleDelete = () => {
    // 删除任务
    Modal.confirm({
      title: "确认删除",
      content: "确认要删除该公告吗?",
      onOk: handleConfirmedDelete,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedDelete = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .delete("/api/announcement", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          announce_id: currentAnnouncement.announce_id,
        },
      })
      .then(() => {
        message.success("已删除！");
        setLoading(false);
        fetchData();
        setEditable(false);
        handleModalClose();
        Modal.destroyAll();
      })
      .catch((error) => {
        console.error(error);
        message.error("删除失败");
        setLoading(false);
      });
  };
  const handleChange = () => {
    // 删除任务
    Modal.confirm({
      title: "确认更改",
      content: "确认要更改公告吗?",
      onOk: handleConfirmedChange,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedChange = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .put(
        "/api/announcement",
        {
          title: currentAnnouncement.title,
          announce_id: currentAnnouncement.announce_id,
          text: currentAnnouncement.text,
          admin_name: currentAnnouncement.admin_name,
          label: currentAnnouncement.label,
          key: currentAnnouncement.key,
          time: Date.now(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        message.success("已修改！");
        setLoading(false);
        fetchData();
        setEditable(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("修改失败");
        setLoading(false);
      });
  };
  const handleNewAnnouncementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value }); // Update new announcement content
  };
  const handleNewAnnouncementModalOpen = () => {
    setIsNewAnnouncementModalOpen(true); // Open new announcement modal
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleSortKeyChange = (value: string) => {
    setSortKey(value);
    fetchData();
  };
  const handleLabelChange = (value: Label) => {
    setLabel(value);
  };
  const handleTitleClick = (record: Announcement) => {
    setCurrentAnnouncement(record);
    setOpen(true);
  };
  const handleModalClose = () => {
    setOpen(false);
  };

  const handleEdit = () => {
    if (isAdmin) {
      if (editable) setEditable(false);
      else setEditable(true);
    } else {
      message.error("没有管理员权限不得修改公告");
    }
  };

  const formatText = (text: string) => {
    return { __html: text ? text.replace(/\n/g, '<br />') : '' };
  }

  const columns : ColumnsType<any>= [
    {
      title: "公告标题",
      width: "25%",
      dataIndex: "title",
      key: "title",
      align: "center",
      render: (text: string, record: Announcement) => (
        <Title
          level={5}
          onClick={() => handleTitleClick(record)}
        >
          {text} {record.key?<StarFilled style={{ color: 'red' }}/>:""}
        </Title>
      ),
    },
    {
      align: "center",
      title: "发布者",
      width: "25%",
      dataIndex: "admin_name",
      key: "admin_name",
    },
    {
      align: "center",
      title: "公告类型",
      width: "25%",
      dataIndex: "label",
      key: "label",
      render: (label: Label) => {
        const { name, color } = mapLabel[label] || { name: "未知", color: "gray" };
        return <Tag color={color}>{name}</Tag>;
      },
    },
    {
      align: "center",
      title: "发布时间",
      dataIndex: "time",
      key: "time",
      render: (timestamp: number) => transTime(timestamp),
    },
  ];

  let filteredData = data;
  if (searchTerm) {
    filteredData = filteredData.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.admin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (label !== "all") {
    filteredData = filteredData.filter((announcement) => announcement.label === label);
  }
  filteredData.sort((a, b) => {
    console.log(`sort by ${sortKey}`)
    console.log(`Sorting a: ${a.key}, b: ${b.key}`);
    console.log(`time: a ${new Date(a.time).getTime().toLocaleString()} b ${new Date(b.time).getTime().toLocaleString()}`)
    if (sortKey === "key") {
      return (b.key ? 1 : 0) - (a.key ? 1 : 0);
    } else {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    }
  });

  const preStyle = {
    maxWidth: '100%', // 限制最大宽度
    overflowX: 'auto' as const, // 如果文本过长，使用滚动条
    whiteSpace: 'pre-wrap' as const, // 保留换行，但是允许自动换行
    wordWrap: 'break-word'as const // 允许单词内部断行
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="根据标题/发布者检索" onChange={handleSearch} />
        <Select defaultValue={sortKey} onChange={handleSortKeyChange} style={{ width: 200 }}>
          <Option value="time">按时间排序</Option>
          <Option value="key">按重要性排序</Option>
        </Select>
        <Select defaultValue={label} onChange={handleLabelChange} style={{ width: 200 }}>
          <Option value="all">所有公告</Option>
          <Option value={Label.Block}><LockOutlined/> 封禁公示</Option>
          <Option value={Label.Maintain}><ToolOutlined /> 维护公告</Option>
          <Option value={Label.Update}><SyncOutlined /> 更新公告</Option>
          <Option value={Label.Other}><InfoCircleOutlined /> 其他公告</Option>
        </Select>
        <Button onClick={() => fetchData()}>获取最新公告列表</Button>
        {isAdmin && <Button onClick={handleNewAnnouncementModalOpen}>新建公告</Button>}
      </Space>
      <Spin spinning={loading}>
        <Table dataSource={filteredData} columns={columns} rowKey="time" />
      </Spin>

      <Modal
        title="公告详情"
        open={open}
        onOk={() => (handleModalClose(), setEditable(false))}
        onCancel={() => (handleModalClose(), setEditable(false))}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {isAdmin ? (
            <>
              <Input
                style={disabledStyle}
                value={currentAnnouncement?.title}
                showCount
                onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})}
                maxLength={20}
                disabled={!editable}
              />
              <TextArea
                style={disabledStyle}
                value={currentAnnouncement?.text}
                showCount
                onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, text: e.target.value})}
                maxLength={1000}
                autoSize={{ minRows: 3, maxRows: 15 }}
                disabled={!editable}
              />
              <Title level={5}>发布者</Title>
              <Input
                style={disabledStyle}
                value={currentAnnouncement?.admin_name}
                showCount
                onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, admin_name: e.target.value})}
                maxLength={20}
                disabled={!editable}
              />
            </>
          ) : (
            <>
              <Card bordered={false}>
                <Space direction="vertical">
                  <Title level={4} style={{ textAlign: 'center' }}>{currentAnnouncement?.title}</Title>
                  {/* <Paragraph>{currentAnnouncement?.text}</Paragraph> */}
                  <pre style={preStyle}>{currentAnnouncement?.text}</pre>
                  {/* <Paragraph dangerouslySetInnerHTML={formatText(currentAnnouncement?.text)} /> */}
                  <Title level={5}>发布者</Title>
                  <Paragraph>{currentAnnouncement?.admin_name}</Paragraph>
                </Space>
              </Card>
            </>
          )}
          
        </Space>
        {isAdmin?<Divider />:<></>}
        <Space>
          {isAdmin && (
            <>
              <Button onClick={handleEdit}>{editable ? "退出修改模式" : "进入修改模式"}</Button>
              {editable && (
                <>
                  <Button onClick={handleChange}>上传修改</Button>
                  <Button onClick={handleDelete}>删除公告</Button>
                </>
              )}
            </>
          )}
        </Space>
      </Modal>
      
      
        <Modal
          title="新建公告"
          open={isNewAnnouncementModalOpen}
          onOk={handleUpload}
          onCancel={() => (
            setIsNewAnnouncementModalOpen(false),
            setNewAnnouncement({
              admin_name: "",
              key: false,
              label: Label.Other,
              text: "",
              time: Date.now(),
              title: "",
            })
          )}
        >
          <Spin spinning={loading}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={5}>标题</Title>
            <Input
              name="title"
              showCount
              value={newAnnouncement.title}
              maxLength={20}
              onChange={handleNewAnnouncementChange}
            />
            <Title level={5}>内容</Title>
            <TextArea
              name="text"
              showCount
              value={newAnnouncement.text}
              maxLength={1000}
              autoSize={{ minRows: 3, maxRows: 5 }}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, text: e.target.value })}
            />
            <Title level={5}>发布者</Title>
            <Input
              name="admin_name"
              showCount
              value={newAnnouncement.admin_name}
              maxLength={20}
              onChange={handleNewAnnouncementChange}
            />
            <Title level={5}>是否为重要公告</Title>
            <Checkbox
              name="key"
              checked={newAnnouncement.key}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, key: e.target.checked })}
            >
              重要
            </Checkbox>
            <Title level={5}>标签</Title>
            <Select
              value={newAnnouncement.label}
              onChange={(value) => setNewAnnouncement({ ...newAnnouncement, label: value })}
            >
              <Option value="block">封禁公告</Option>
              <Option value="maintain">维护公告</Option>
              <Option value="other">其他公告</Option>
              <Option value="update">更新公告</Option>
            </Select>
          </Space>
          </Spin>
        </Modal>
    </Space>
  );
};
