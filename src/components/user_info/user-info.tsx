import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Modal,
  Progress,
  Row,
  Select,
  SelectProps,
  Tag,
  Tooltip,
  message,
  Space,
  Spin,
  Grid,
} from "antd";
import { ProCard } from "@ant-design/pro-components";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { HelpOutline } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { mapLevel2Exp, mapLevel2Zh, mapTag2Zh } from "@/const/interface";
import { request } from "@/utils/network";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CryptoJS from "crypto-js";
import { SpeedDial } from "@mui/material";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CurrencyYuanIcon from "@mui/icons-material/CurrencyYuan";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RankList from "../RankList";
import { SketchOutlined, CrownOutlined } from "@ant-design/icons";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export interface UsersInfo {
  username: string;
  invitecode: string;
  level: string;
  exp: number;
  points: number;
  email: string;
  credits: number;
  prefer: string | null;
  is_bound: boolean;
  is_vip: boolean;
}

interface UsersInfoProps {
  role: "demander" | "labeler" | "administrator" | "agent";
}

const UserInfo = (props: UsersInfoProps) => {
  const [info, setInfo] = useState<UsersInfo>({
    username: "名字五个字",
    invitecode: "邀请码二十个字",
    level: "bronze",
    exp: 0,
    points: 0,
    email: "邮箱五个字",
    credits: 0,
    prefer: null,
    is_bound: false,
    is_vip: false,
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [value, setValue] = React.useState(0);
  const [accountBalance, setAccountBalance] = useState<{ bank_account: string; balance: string }[]>(
    []
  );
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCXModalOpen, setIsCXModalOpen] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [addScore, setAddScore] = useState<boolean>(false);
  const [isBoundModalOpen, setIsBoundModalOpen] = useState<boolean>(false);
  const [accountValue, setAccountValue] = useState<number>(0);
  const [disboundModalOpen, setDisboundModalOpen] = useState<boolean>(false);

  const getBoundAccounts = async () => {
    request("/api/bound_accounts", "GET")
      .then((response) => {
        setAccountBalance(response.data.accounts);
      })
      .catch((error) => {
        message.error(`银行卡信息获取失败, ${error.response.data.message}`);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  useEffect(() => {
    request("/api/account_info", "GET")
      .then((response) => {
        setInfo(response.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        getBoundAccounts();
      });
  }, [refreshing]);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleChange2 = (_: React.SyntheticEvent, newValue: number) => {
    setAccountValue(newValue);
  };
  const update_prefer = async (prefer: string[]) => {
    request("/api/update_prefer", "POST", {
      prefer: prefer,
    })
      .then(() => {
        message.success("更新偏好标签成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`更新偏好失败，${error.response.data.message}`);
        } else {
          message.error("更新偏好失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const postBound = async (bank_account: string, hashedPassword: string) => {
    request("/api/bound", "POST", {
      bank_account: bank_account,
      password: hashedPassword,
    })
      .then(() => {
        message.success("银行卡绑定成功");
        setIsBoundModalOpen(false);
      })
      .catch((error) => {
        message.error(`银行卡绑定失败, ${error.response.data.message}`);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const exchange = async (
    score: number,
    add_score: boolean,
    bank_account: string,
    hashedPassword: string
  ) => {
    request("/api/exchange", "POST", {
      score: score,
      add_score: add_score,
      bank_account: bank_account,
      password: hashedPassword,
    })
      .then(() => {
        message.success((addScore ? "充值" : "提现") + "成功");
      })
      .catch(() => {
        message.error((addScore ? "充值" : "提现") + "失败");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const disbound = async (bank_account: string) => {
    request("/api/untie", "POST", {
      bank_account: bank_account,
    })
      .then(() => {
        message.success("解绑成功");
      })
      .catch(() => {
        message.error("解绑失败");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const preferTag: SelectProps["options"] = [
    {
      label: "情感分类/分析",
      value: "sentiment",
    },
    {
      label: "词性分类",
      value: "part-of-speech",
    },
    {
      label: "意图揣测",
      value: "intent",
    },
    {
      label: "事件概括",
      value: "event",
    },
  ];
  return (
    <>
      <Spin spinning={refreshing || loading}>
        <Modal
          open={isInviteModalOpen}
          onCancel={() => {
            setIsInviteModalOpen(false);
          }}
          footer={null}
        >
          <h2 style={{ textAlign: "center" }}>邀请码</h2>
          <Divider />
          <p>
            为了<b>造福</b>广大用户，扩大306众包平台的影响力，我们为每个用户配备了邀请码。
          </p>
          <p>
            请将这个邀请码分享给您的朋友，如果他们在注册本平台账号可以填写您的邀请码，您和您的朋友将获得丰厚的
            <span style={{ color: "green" }}>点数奖励</span>，<b>邀请越多，奖励越多</b>。
          </p>
          <p>
            赶快将邀请码分享到<span style={{ color: "red" }}>QQ群、微信群</span>
            等平台赢取精美大奖吧！！！
          </p>
        </Modal>
        <ProCard split="vertical">
          <ProCard colSpan={"50%"}>
            <Card
              hoverable
              style={{
                marginTop: props.role === "labeler" ? 0 : 50,
              }}
            >
              <Row
                style={{
                  textAlign: "center",
                }}
              >
                <Col span={24}>
                  <Avatar
                    size={60}
                    style={{
                      backgroundColor: "rgb(243, 196, 41)",
                      fontSize: 35,
                    }}
                  >
                    {info.username[0]}
                  </Avatar>
                </Col>
              </Row>
              <Row
                style={{
                  textAlign: "center",
                }}
              >
                <Col span={24}>
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <h2>
                      {info.username} <Divider type="vertical" />
                      <Tag color={mapLevel2Zh[info.level]["color"]}>
                        {info.level === "gold" ? (
                          <CrownOutlined style={{ marginRight: 3 }} />
                        ) : info.level === "diamond" ? (
                          <SketchOutlined style={{ marginRight: 3 }} />
                        ) : (
                          <></>
                        )}
                        {mapLevel2Zh[info.level]["name"]}
                      </Tag>
                    </h2>
                    <span style={{ color: "#999999" }}>{info.email}</span>
                  </div>
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={8}>
                  经验:
                  <Tooltip title={`当前经验：${info.exp}，下一级需要：${info.level==="diamond"?"您已升至最高等级":mapLevel2Exp[info.level]}`}>
                    <Progress
                      size="small"
                      percent={(info.exp / mapLevel2Exp[info.level]) * 100}
                      type="circle"
                      format={() => `${info.exp}`}
                    />
                  </Tooltip>
                </Col>
                <Col span={8}>
                  点数:
                  <Tooltip title="需求方发布任务需要消耗点数，可提现">
                    <Progress
                      size="small"
                      percent={info.points / 100}
                      type="circle"
                      format={() => `${info.points}分`}
                    />
                  </Tooltip>
                </Col>
                <Col>
                  信用分:
                  <Tooltip
                    title={
                      info.credits > 90
                        ? "维持较高的信用分有利于你更快的获取服务"
                        : info.credits < 75
                        ? "当前信用分较低，可能会影响您获取服务"
                        : "当前信用分存在风险，请文明操作，及时回复"
                    }
                  >
                    <Progress
                      size="small"
                      percent={info.credits}
                      type="circle"
                      format={(percent) => `${percent}分`}
                      strokeColor={
                        info.credits < 75
                          ? "red"
                          : info.credits > 90
                          ? "rgb(33, 198, 39)"
                          : "orange"
                      }
                    />
                  </Tooltip>
                </Col>
              </Row>
              <Divider />
              {props.role === "labeler" ? (
                <>
                  <Tooltip title="设置偏好标签有助于你获得任务">
                    <>
                      <h3>
                        偏好标签：
                        <Tag color="cyan">{info.prefer ? mapTag2Zh[info.prefer] : "暂无标签"}</Tag>
                      </h3>
                    </>
                  </Tooltip>
                  <Form
                    onFinish={(values) => {
                      setLoading(true);
                      update_prefer(values.prefer);
                    }}
                  >
                    <Row>
                      <Col span={20}>
                        <Form.Item name="prefer">
                          <Select allowClear options={preferTag} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button type="primary" htmlType="submit">
                          更新
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  <Divider />
                </>
              ) : (
                <></>
              )}
              <Row>
                <Col span={18}>
                  <b>
                    邀请码: <span id="invitecode">{info.invitecode}</span>
                  </b>
                </Col>
                <Col span={2}>
                  <Tooltip title="什么是邀请码">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        setIsInviteModalOpen(true);
                      }}
                      icon={<HelpOutline />}
                    />
                  </Tooltip>
                </Col>
                <Col>
                  <Tooltip title="点击此处复制邀请码，请确保您使用的是https连接。">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        const invitecode = document.getElementById("invitecode");
                        const clipboardObj = navigator.clipboard;
                        if (clipboardObj) {
                          clipboardObj
                            .writeText(invitecode ? invitecode.innerText : "")
                            .then(() => {
                              message.success("复制成功");
                            })
                            .catch(() => {
                              message.error("复制失败，请稍后重试");
                            });
                        } else {
                          message.warning("复制失败，请确保您采用的是https安全连接");
                        }
                      }}
                      icon={<ContentCopyIcon />}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Card>
          </ProCard>
          <ProCard>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="账户与充值" {...a11yProps(0)} />
                  <Tab label="排行榜" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                <Modal
                  open={isBoundModalOpen}
                  onCancel={() => {
                    setIsBoundModalOpen(false);
                  }}
                  onOk={() => {
                    setIsBoundModalOpen(false);
                  }}
                  footer={null}
                  destroyOnClose
                >
                  <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
                    绑定银行卡
                  </Typography>
                  <Divider />
                  <Form
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={(values) => {
                      setLoading(true);
                      const hashPassword = CryptoJS.SHA256(values.password).toString();
                      postBound(values.bank_account, hashPassword);
                      setIsBoundModalOpen(false);
                    }}
                    autoComplete="off"
                  >
                    <Form.Item
                      name="bank_account"
                      rules={[
                        {
                          required: true,
                          message: "不得为空",
                        },
                        ({}) => ({
                          validator(_, value) {
                            const r = /^\+?[1-9][0-9]*$/;
                            if (value && !r.test(value)) {
                              return Promise.reject(new Error("银行卡账号必须由数字组成"));
                            }
                            if (value && (value.length < 15 || value.length > 19)) {
                              return Promise.reject(new Error("银行卡账号必须为15~19位"));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <TextField
                        margin="normal"
                        fullWidth
                        id="bank_account"
                        label="银行卡账号"
                        name="bank_account"
                        autoFocus
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "不得为空",
                        },
                        ({}) => ({
                          validator(_, value) {
                            const r = /^\+?[1-9][0-9]*$/;
                            if (value && !r.test(value)) {
                              return Promise.reject(new Error("银行卡密码必须由数字组成"));
                            }
                            if (value && value.length !== 6) {
                              return Promise.reject(new Error("银行卡密码必须为6位"));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <TextField
                        type="password"
                        margin="normal"
                        fullWidth
                        id="password"
                        label="密码"
                        name="password"
                        autoFocus
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      block
                      htmlType="submit"
                      size="large"
                      style={{
                        backgroundColor: "#3b5999",
                        marginTop: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      绑定
                    </Button>
                  </Form>
                </Modal>
                <Alert severity={info.is_bound ? "success" : "warning"}>
                  该账号{info.is_bound ? "已" : "未"}绑定{accountBalance.length == 3 ? "3张" : ""}
                  银行卡{accountBalance.length == 3 ? "，无法继续绑定" : ""}
                  {accountBalance.length == 3 ? (
                    <></>
                  ) : (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setIsBoundModalOpen(true);
                      }}
                    >
                      点击此处绑定
                    </Button>
                  )}
                </Alert>
                <Card
                  title={"账户信息 "}
                  extra={
                    <Button
                      type="text"
                      size="large"
                      disabled={!info.is_bound}
                      onClick={() => {
                        setVisible((i) => !i);
                      }}
                      icon={
                        <Tooltip title={visible ? "点击此处隐藏" : "点击此处显示"}>
                          {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Tooltip>
                      }
                    />
                  }
                >
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Tabs
                        value={accountValue}
                        onChange={handleChange2}
                        aria-label="basic tabs example"
                      >
                        {accountBalance.map((_, idx) => (
                          <Tab label={`账户${idx + 1}`} {...a11yProps(idx)} key={idx} />
                        ))}
                      </Tabs>
                    </Box>
                    {accountBalance.map((account, idx) => (
                      <TabPanel value={accountValue} index={idx} key={idx}>
                        <Row>
                          <Col span={14}>
                            <h3>银行卡卡号 (No.) : </h3>
                            <p>{visible ? account.bank_account : "******************"}</p>
                          </Col>
                          <Col>
                            <h3>账户余额 (CNY) : </h3>
                            <p>{visible ? `${account.balance}.00` : "********"}</p>
                          </Col>
                        </Row>
                        <br />
                        <br />
                        <SpeedDial
                          ariaLabel="SpeedDial basic example"
                          sx={{ position: "absolute", bottom: 16, right: 16 }}
                          icon={<SpeedDialIcon />}
                        >
                          <SpeedDialAction
                            onClick={() => {
                              setAddScore(true);
                              setIsCXModalOpen(true);
                            }}
                            icon={<AddShoppingCartIcon />}
                            tooltipTitle="充值"
                          />
                          <SpeedDialAction
                            onClick={() => {
                              setAddScore(false);
                              setIsCXModalOpen(true);
                            }}
                            icon={<CurrencyYuanIcon />}
                            tooltipTitle="提现"
                          />
                          <SpeedDialAction
                            onClick={() => {
                              setDisboundModalOpen(true);
                              // setLoading(true);
                              // disbound(account.bank_account);
                            }}
                            icon={<LockOpenIcon />}
                            tooltipTitle="解绑"
                          />
                        </SpeedDial>
                        <Modal
                          open={disboundModalOpen}
                          footer={[
                            <Button
                              key="ok"
                              onClick={() => {
                                setLoading(true);
                                disbound(account.bank_account);
                                setDisboundModalOpen(false);
                              }}
                              style={{
                                backgroundColor: "#3b5999",
                                color: "white",
                              }}
                            >
                              确认
                            </Button>,
                            <Button
                              key="cancel"
                              style={{ backgroundColor: "#3b5999", color: "white" }}
                              onClick={() => {
                                setDisboundModalOpen(false);
                              }}
                            >
                              取消
                            </Button>,
                          ]}
                          title="确认要解绑该账户吗?"
                          onCancel={() => {
                            setDisboundModalOpen(false);
                          }}
                        >
                          解绑之后你将无法对该账户进行充值和提现操作，但你可以重新将这张卡绑定
                        </Modal>
                        <Modal
                          open={isCXModalOpen}
                          onCancel={() => setIsCXModalOpen(false)}
                          footer={null}
                          destroyOnClose
                        >
                          <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
                            {addScore ? "充值" : "提现"}
                          </Typography>
                          <Divider />
                          <p>注: 1 元 = 10 点数</p>
                          <Form
                            name="basic"
                            initialValues={{ remember: true }}
                            onFinish={(values) => {
                              setLoading(true);
                              const hashPassword = CryptoJS.SHA256(values.password).toString();
                              exchange(values.score, addScore, account.bank_account, hashPassword);
                              setIsCXModalOpen(false);
                            }}
                            autoComplete="off"
                          >
                            <Form.Item
                              name="score"
                              rules={[
                                {
                                  required: true,
                                  message: "不得为空",
                                },
                                ({}) => ({
                                  validator(_, value) {
                                    const r = /^\+?[1-9][0-9]*$/;
                                    if (value && !r.test(value)) {
                                      return Promise.reject(new Error("请输入数字"));
                                    }
                                    if (
                                      value &&
                                      addScore &&
                                      parseInt(account.balance) * 10 < value
                                    ) {
                                      return Promise.reject(new Error("余额不足"));
                                    }
                                    if (value && !addScore && info.points < value) {
                                      return Promise.reject(new Error("点数不足"));
                                    }
                                    return Promise.resolve();
                                  },
                                }),
                              ]}
                            >
                              <TextField
                                margin="normal"
                                fullWidth
                                id="score"
                                label={`${addScore ? "充值" : "提现"}点数`}
                                name="score"
                                autoFocus
                              />
                            </Form.Item>
                            <Form.Item
                              name="password"
                              rules={[
                                {
                                  required: true,
                                  message: "不得为空",
                                },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    const r = /^\+?[1-9][0-9]*$/;
                                    if (value && !r.test(value)) {
                                      return Promise.reject(new Error("银行卡密码必须由数字组成"));
                                    }
                                    if (value && value.length !== 6) {
                                      return Promise.reject(new Error("银行卡密码必须为6位"));
                                    }
                                    return Promise.resolve();
                                  },
                                }),
                              ]}
                            >
                              <TextField
                                type="password"
                                margin="normal"
                                fullWidth
                                id="password"
                                label="密码"
                                name="password"
                                autoFocus
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
                              {addScore ? "充值" : "提现"}
                            </Button>
                          </Form>
                        </Modal>
                      </TabPanel>
                    ))}
                  </Box>
                </Card>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <div>
                  <RankList />
                </div>
              </TabPanel>
            </Box>
          </ProCard>
        </ProCard>
      </Spin>
    </>
  );
};

export default UserInfo;
