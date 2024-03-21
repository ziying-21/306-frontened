import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Statistic,
  Button,
  Modal,
  Progress,
  message,
  Tag,
  Space,
  Tooltip,
  Spin,
  Select,
  Divider,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  SketchOutlined,
  CrownOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  HourglassTwoTone,
  FieldTimeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  GoldOutlined,
} from "@ant-design/icons";
import styles from "./vip.module.css";
import axios from "axios";
import { mapLevel2Exp, mapLevel2Zh } from "@/const/interface"; // Importing your mappings

interface Info {
  username: string;
  level: string;
  exp: number;
  points: number;
}

const MemberComponent = () => {
  const [accountInfo, setAccountInfo] = useState<Info>({
    username: "名字五个字",
    level: "bronze",
    exp: 0,
    points: 0,
  });
  const [waitLoading, setWaitLoading] = useState(false);
  const [vipExpiry, setVipExpiry] = useState<number>(Date.now());
  console.log("vipExpiry:", vipExpiry);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [timer, setTimer] = useState<string>("");
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // Using ref to hold the intervalId

  const [showModal, setShowModal] = useState(false);
  const [helpModal_1, setHelpModal_1] = useState(false);
  const [helpModal_2, setHelpModal_2] = useState(false);
  const [buyExpModal, setBuyExpModal] = useState(false);
  const [buyTimeModal, setBuyTimeModal] = useState(false);
  const [exchangeValue, setExchangeValue] = useState<number>(100);
  const [vipTime, setVipTime] = useState<number>(15);
  const token = localStorage.getItem("token");
  const { Option } = Select;
  const { Title } = Typography;

  useEffect(() => {
    fetchAccountInfo();
  }, []);
  useEffect(() => {
    if (vipExpiry > 0) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      intervalIdRef.current = setInterval(() => {
        const now = Date.now();
        const diffSec = Math.floor((vipExpiry - now) / 1000);
        console.log("ddl:", new Date(vipExpiry));
        console.log("Now:", new Date(Date.now()));
        console.log(`Time difference in seconds: ${diffSec}`); // 打印时间差，单位为秒
        if (now >= vipExpiry) {
          setTimer(accountInfo.level === "diamond" ? "永久享受最低流量限制" : "流量包已不可用");
          if (!(accountInfo.level === "diamond")) {
            if (!isExpired) {
              // check if the package was not expired, but now it is
              setIsExpired(true); // set it as expired
              // message.info("流量包已过期"); // only show the message when it first expired
            }
          }
          clearInterval(intervalIdRef.current as NodeJS.Timeout); // stop the interval
        } else {
          const diffSec = Math.floor((vipExpiry - now) / 1000);
          const hours = Math.floor(diffSec / 3600);
          const minutes = Math.floor((diffSec % 3600) / 60);
          const seconds = diffSec % 60;
          setTimer(`${hours}h ${minutes}m ${seconds}s`);
          if (isExpired) {
            // if it was expired, but now it is not, update the state
            setIsExpired(false);
          }
        }
      }, 1000);
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [vipExpiry]);

  const fetchAccountInfo = () => {
    setWaitLoading(true);
    axios
      .get("/api/account_info", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setAccountInfo(response.data);
        setVipExpiry(response.data.ddl_time * 1000 + (8 * 60 * 60 * 1000 - 2000));
        console.log("ddl:", response.data.ddl_time * 1000 + (8 * 60 * 60 * 1000 - 2000),"now",Date.now());
        setWaitLoading(false);
      })
      .catch((error) => {
        message.error("获取账户信息失败");
        console.error(error);
        setWaitLoading(false);
      });
  };
  const buyExperience = () => {
    Modal.confirm({
      title: "确认兑换",
      content: `确定要兑换 ${exchangeValue} 点经验吗？`,
      onOk: handleConfirmedBuyExperience,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedBuyExperience = () => {
    if (
      exchangeValue <= 0 ||
      !(exchangeValue === 100 || exchangeValue === 200 || exchangeValue === 500)
    ) {
      message.error(`不合法的经验包大小: ${exchangeValue} Exp`);
      return;
    }
    setWaitLoading(true);
    axios
      .post(
        "/api/exp",
        { points: exchangeValue },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        // setAccountInfo(response.data);
        setBuyExpModal(false);
        setWaitLoading(false);
        fetchAccountInfo();
        message.success("经验兑换成功");
      })
      .catch((error) => {
        console.error(error);
        message.error(`兑换失败: ${error.response.data.message}`);
        setWaitLoading(false);
      });
  };

  const buyVipTime = () => {
    Modal.confirm({
      title: "确认开通",
      content: `确定要开通 ${vipTime}s 流量包吗？`,
      onOk: handleConfirmedBuyVipTime,
      onCancel: () => {
        Modal.destroyAll(); // 关闭所有弹窗
      },
    });
  };
  const handleConfirmedBuyVipTime = () => {
    if (vipTime <= 0 || !(vipTime === 15 || vipTime === 30 || vipTime === 60)) {
      message.error(`不合法的流量包时长: ${vipTime}s`);
      return;
    }
    setWaitLoading(true);
    axios
      .post(
        "/api/membership",
        { vip_time: vipTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setVipExpiry(response.data.ddl_time * 1000 + (8 * 60 * 60 * 1000 - 2000));
        console.log("ddl:", new Date(response.data.ddl_time * 1000 + (8 * 60 * 60 * 1000 - 2000)));
        setBuyTimeModal(false);
        setWaitLoading(false);
        message.success(`成功购买 ${vipTime}s 流量包`);
        fetchAccountInfo();
      })
      .catch((error) => {
        message.error(`购买失败: ${error.response.data.message}`);
        console.error(error);
        setWaitLoading(false);
      });
  };

  const getLevelProgress = (level: string) => {
    return (accountInfo.exp / mapLevel2Exp[level]) * 100;
  };
  const getColor = (level: string) => {
    switch (level) {
      case "bronze" || "silver":
        return "#C0C0C0"; // 银色
      case "gold":
        return "#FFD700"; // 金色
      default:
        return "#000000"; // 默认颜色
    }
  };

  return (
    <div>
      <Tooltip
        title={
          <span>
            <FieldTimeOutlined /> {timer}
          </span>
        }
      >
        <Button
          type="text"
          icon={
            accountInfo.level === "diamond" || vipExpiry - Date.now() > 1000 ? (
              <SketchOutlined className={styles.rainbow} />
            ) : (
              <CrownOutlined style={{ color: getColor(accountInfo.level) }} />
            )
          }
          onClick={() => (setShowModal(true), fetchAccountInfo())}
          style={{
            fontSize: "20px",
            width: "80",
            height: "12vh",
            color: "white",
          }}
        />
      </Tooltip>

      {showModal && (
        <Modal open={showModal} onCancel={() => setShowModal(false)} footer={null} width={700}>
          <Spin spinning={waitLoading&&showModal}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Space>
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}>
                  会员中心
                </div>
                {accountInfo.level === "diamond" || vipExpiry - Date.now() > 1000 ? (
                  <CrownOutlined className={styles.rainbow} style={{ fontSize: "30px" }} />
                ) : (
                  <CrownOutlined style={{ color: getColor(accountInfo.level), fontSize: "30px" }} />
                )}
              </Space>
            </div>
            <Divider />
            <Row
              gutter={16}
              justify="space-around"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Col style={{ textAlign: "center" }}>
                <Avatar
                  size={60}
                  style={{
                    backgroundColor: "rgb(243, 196, 41)",
                    fontSize: 35,
                  }}
                >
                  {accountInfo.username[0]}
                </Avatar>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Space>
                    <UserOutlined />
                    <h2>{accountInfo.username}</h2>
                    <Tag color={mapLevel2Zh[accountInfo.level].color}>
                      {mapLevel2Zh[accountInfo.level].name}
                    </Tag>
                  </Space>
                </div>
              </Col>
              <Col style={{ textAlign: "center" }} span={8}>
                <Statistic
                  title="点数余额"
                  value={accountInfo.points}
                  prefix={<GoldOutlined style={{ color: "gold" }} />}
                />
                <Divider />
                <HourglassTwoTone /> {timer}
              </Col>
              <Col style={{ textAlign: "center" }} span={8}>
                <Progress
                  size={[120, 200]}
                  percent={getLevelProgress(accountInfo.level)}
                  type="circle"
                  strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  format={(percent) => (
                    <>
                      <div style={{ fontSize: "10px" }}>经验</div>
                      <div>{percent?.toFixed(0)}%</div>
                    </>
                  )}
                />
              </Col>
            </Row>
            <Divider />
            <Row justify="center">
              <Space>
                {/* <InputNumber min={1} max={accountInfo && accountInfo.points} onChange={value => setExchangeValue(value || 0)} /> */}
                {/* {(waitLoading) ? <Spin tip="Waitng..."/> : */}
                <Select
                  value={exchangeValue}
                  onChange={(value: number) => setExchangeValue(value)}
                  placeholder="选择经验包大小"
                >
                  <Option value={100} disabled={accountInfo && accountInfo.points < 100}>
                    100 Exp 包
                  </Option>
                  <Option value={200} disabled={accountInfo && accountInfo.points < 200}>
                    200 Exp 包
                  </Option>
                  <Option value={500} disabled={accountInfo && accountInfo.points < 500}>
                    500 Exp 包
                  </Option>
                </Select>
                <Button
                  disabled={
                    accountInfo && (accountInfo.points <= 0 || accountInfo.level === "Diamond")
                  }
                  onClick={buyExperience}
                  icon={<RocketOutlined />}
                >
                  兑换经验包
                </Button>
                <Tooltip title="什么是经验包">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setHelpModal_1(true);
                    }}
                    icon={<QuestionCircleOutlined />}
                  />
                </Tooltip>
              </Space>
            </Row>
            <Divider />
            <Row justify="center">
              <Space>
                <Select
                  value={vipTime}
                  onChange={(value: number) => setVipTime(value)}
                  placeholder="选择流量包时长"
                >
                  <Option value={15} disabled={accountInfo && accountInfo.points < 5}>
                    15s 流量包
                  </Option>
                  <Option value={30} disabled={accountInfo && accountInfo.points < 9}>
                    30s 流量包
                  </Option>
                  <Option value={60} disabled={accountInfo && accountInfo.points < 15}>
                    60s 流量包
                  </Option>
                </Select>
                <Button
                  disabled={
                    accountInfo && (accountInfo.points <= 0 || accountInfo.level === "Diamond")
                  }
                  onClick={buyVipTime}
                  icon={<ThunderboltOutlined />}
                >
                  开通流量包
                </Button>
                <Tooltip title="什么是流量包">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setHelpModal_2(true);
                    }}
                    icon={<QuestionCircleOutlined />}
                  />
                </Tooltip>
              </Space>
            </Row>
          </Spin>
        </Modal>
      )}

      {helpModal_1 && (
        <Modal
          onCancel={() => setHelpModal_1(false)}
          open={helpModal_1}
          title={"流量包"}
          footer={null}
        >
          <p>
            各会员等级升级所需经验<b>不同</b>，会员等级提升可以<b>永久享受</b>流量限制降低
          </p>
          <p>
            您当前的等级是: <b>{mapLevel2Zh[accountInfo.level].name}</b>, 还需要{" "}
            <span style={{ color: "red" }}>
              {mapLevel2Exp[accountInfo.level] - accountInfo.exp}
            </span>{" "}
            Exp 才能升级
          </p>
          <p>
            目前提供三种大小的经验包: <b>100 Exp</b>, <b>200 Exp</b>, <b>500 Exp</b>, 经验和点数
            <span style={{ color: "red" }}>1:1</span>兑换
          </p>
        </Modal>
      )}

      {helpModal_2 && (
        <Modal
          onCancel={() => setHelpModal_2(false)}
          open={helpModal_2}
          title={"流量包"}
          footer={null}
        >
          <p>
            不同的会员等级对应不同的流量限制，低等级会员购买流量包可以<b>暂时</b>获得
            <span style={{ color: "red" }}>钻石级别</span>流量限制
          </p>
          <p>
            您当前的等级是: <b>{mapLevel2Zh[accountInfo.level].name}</b>
          </p>
          <p>
            目前提供三种时长的流量包: <b>15s</b>, <b>30s</b>, <b>60s</b>, 分别需要消耗 <b>5</b>,{" "}
            <b>9</b>, <b>15</b> 点数
          </p>
        </Modal>
      )}
    </div>
  );
};

export default MemberComponent;
