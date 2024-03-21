import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Spin, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AdministratorCheckDemander = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [demanders, setDemanders] = useState<{ username: string; invitecode: string }[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    axios
      .get("/api/demander_apply", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const newDemanders = response.data.data;
        setDemanders(newDemanders);
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
  const columns: ColumnsType<any> = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      align: "center",
      filterDropdown: () => (
        <Input.Search placeholder="搜索用户名" onChange={(e) => {setSearchName(e.target.value)}}/>
      ),
      filterIcon: <SearchOutlined/>
    },
    {
      title: "邀请码",
      dataIndex: "invitecode",
      key: "invitecode",
      align: "center",
      filterDropdown: () => (
        <Input.Search placeholder="搜索邀请码" onChange={(e) => {setSearchCode(e.target.value)}}/>
      ),
      filterIcon: <SearchOutlined/>
    },
    {
      title: "审核操作",
      key: "check",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              axios
                .post(
                  "/api/apply_result",
                  {
                    username: `${record.username}`,
                    result: true,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                )
                .then(() => {
                  message.success("审核结果提交成功");
                })
                .catch((error) => {
                  if (error.response) {
                    message.error(`审核结果提交失败，${error.response.data.message}`);
                  } else {
                    message.error("网络失败，请稍后再试");
                  }
                })
                .finally(() => {
                  setRefreshing(true);
                });
            }}
          >
            通过
          </Button>
          <Button
            type="link"
            onClick={() => {
              axios
                .post(
                  "/api/apply_result",
                  {
                    username: `${record.username}`,
                    result: true,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                )
                .then(() => {
                  message.success("审核结果提交成功");
                })
                .catch((error) => {
                  if (error.response) {
                    message.error(`审核结果提交失败，${error.response.data.message}`);
                  } else {
                    message.error("网络失败，请稍后再试");
                  }
                })
                .finally(() => {
                  setRefreshing(true);
                });
            }}
          >
            不通过
          </Button>
        </>
      ),
    },
  ];
  let filteredData = demanders;
  filteredData = demanders.filter(
    (announcement) =>
      announcement.username.toLowerCase().includes(searchName.toLowerCase())
  )
  filteredData = filteredData.filter(
    (announcement) =>
      announcement.invitecode?.toLowerCase().includes(searchCode.toLowerCase())
  )
  return (
    <Spin spinning={refreshing} tip="加载中...">
      <Table columns={columns} dataSource={demanders} />
    </Spin>
  );
};

export default AdministratorCheckDemander;
