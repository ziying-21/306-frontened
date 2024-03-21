import { mapLS2CN, mapLevel2Zh, mapRole2En } from "@/const/interface";
import { request } from "@/utils/network";
import { SearchOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Button,
  Tag,
  message,
  Table,
  Modal,
  Divider,
  Descriptions,
  Form,
  Spin,
  Input,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

interface UserDetail {
  username: string;
  invitecode: string;
  level: "bronze" | "silver" | "gold" | "diamond";
  exp: number;
  points: number;
  credits: number;
  role: string;
  is_blocked: boolean;
  is_vip: boolean;
  state: number;
}

const AdministratorAccount = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<UserDetail[]>([]);
  const [detail, setDetail] = useState<UserDetail>({
    username: "",
    invitecode: "",
    level: "bronze",
    exp: 0,
    points: 0,
    credits: 0,
    role: "demander",
    is_blocked: true,
    is_vip: false,
    state: 0,
  });
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [blockModalOpen, setBlockModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [searchName, setSearchName] = useState<string>("");
  useEffect(() => {
    request("/api/administrator/user_info", "GET")
      .then((response) => {
        setUserList(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取用户列表失败，${error.response.data.message}`);
        } else {
          message.error("获取用户列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);
  const block = async (
    username: string,
    block: boolean,
    time: number | undefined,
    description: string | undefined
  ) => {
    request("/api/block_account", "POST", {
      username: username,
      block: block,
      time: time,
      description: description,
    })
      .then(() => {
        message.success(`${block ? "封禁" : "解封"}成功`);
        setBlockModalOpen(false)
      })
      .catch((error) => {
        if (error.response) {
          message.error(`操作失败，${error.response.data.message}`);
        } else {
          message.error("操作失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
        setModalLoading(false);
      });
  };
  const userListColumns: ColumnsType<any> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      width: "25%",
      filterIcon: <SearchOutlined/>,
      render: (username, record) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setDetailModalOpen(true);
            }}
          >
            {username}
          </Button>
        );
      },
      filterDropdown: () => (
        <Input.Search placeholder="搜索用户名" onChange={(e) => {setSearchName(e.target.value)}}/>
      )
    },
    {
      title: "身份",
      dataIndex: "role",
      key: "role",
      align: "center",
      width: "25%",
      filters: [
        {
          text: "需求方",
          value: "demander",
        },
        {
          text: "标注方",
          value: "labeler",
        },
        {
          text: "中介",
          value: "agent",
        },
        {
          text: "管理员",
          value: "administrator",
        },
      ],
      onFilter: (values, record) => record.role === values,
      render: (role) => {
        return <p>{mapRole2En[role]}</p>;
      },
    },
    {
      title: "状态",
      dataIndex: "is_blocked",
      key: "is_blocked",
      align: "center",
      width: "25%",
      filters: [
        {
          text: "已封禁",
          value: 5,
        },
        {
          text: "正常",
          value: 4,
        },
        {
          text: "空闲",
          value: 0
        },
        {
          text: "已分发",
          value: 1
        },
        {
          text: "标注中",
          value: 2
        }
      ],
      onFilter: (values, record) => {
        if(values===0||values===1||values===2) {
          return record.role==="labeler"&&record.state===values;
        } else if (values===4){
          return !record.is_blocked
        } else if (values===5) {
          return record.is_blocked
        }
        return false
      },
      render: (is_blocked, record) => {
        return is_blocked ? (
          <Tag color="rgb(252, 61, 14)">已封禁</Tag>
        ) : (
          record.role==="labeler"?
          (
            <Tag color={mapLS2CN[record.state].color}>{mapLS2CN[record.state].name}</Tag>
          )
          :
          (<Tag color="rgb(33, 198, 39)">正常</Tag>)
        );
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      width: "25%",
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                setBlockModalOpen(true);
                setDetail(record);
              }}
              disabled={record.is_blocked}
            >
              封禁
            </Button>
            <Button
              type="link"
              onClick={() => {
                setLoading(true);
                block(record.username, false, undefined, undefined);
              }}
              disabled={!record.is_blocked}
            >
              解封
            </Button>
          </>
        );
      },
    },
  ];

  let filteredData = userList;
  filteredData = userList.filter(
    (announcement) =>
      announcement.username.toLowerCase().includes(searchName.toLowerCase())
  )
  return (
    <>
      <Modal
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        footer={null}
        open={detailModalOpen}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          用户详情
        </Typography>
        <Divider></Divider>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="用户名" span={4}>
            {detail.username}
          </Descriptions.Item>
          <Descriptions.Item label="身份" span={4}>
            {detail.role}
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
          <Descriptions.Item label="邀请码" span={4}>
            {detail.invitecode}
          </Descriptions.Item>
          <Descriptions.Item label="会员权限" span={4}>
            {detail.is_vip ? "有" : "无"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Modal open={blockModalOpen} onCancel={() => { setBlockModalOpen(false) }} footer={null} destroyOnClose>
        <Spin spinning={modalLoading} tip="处理结果提交中，请稍候...">
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          封禁账号
        </Typography>
        <Divider />
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setModalLoading(true);
            block(detail.username, true, values.time, values.description);
          }}
          autoComplete="off"
        >
          <p>作为管理员，您可以在某个账号严重违反规范时对其进行封禁</p>
          <p>你需要设置封禁天数，若要无限期封禁请将天数设为0</p>
          <Form.Item
            name="time"
            rules={[
              { required: true, message: "不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value < 0) {
                    return Promise.reject(new Error("封禁天数不能为负数"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextField
              name="time"
              fullWidth
              id="time"
              label="封禁时长(分钟)"
              autoFocus
              type="number"
            />
          </Form.Item>
          <p>管理员需要对封禁情况进行说明以便用户更好的规范自己的行为</p>
          <Form.Item name="description" rules={[{ required: true, message: "说明不能为空" }]}>
            <TextField
              name="description"
              fullWidth
              id="description"
              label="情况说明"
              autoFocus
              type="description"
              multiline
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
        </Spin>
      </Modal>
      <Table
        columns={userListColumns}
        dataSource={filteredData}
        loading={refreshing || loading || modalLoading}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
};

export default AdministratorAccount;
