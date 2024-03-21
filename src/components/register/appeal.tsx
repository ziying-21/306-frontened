import { request } from "@/utils/network";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Button, Divider, Form, Input, Spin, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const { Search } = Input;

interface AppealProps {
  setrefreshing: Dispatch<SetStateAction<boolean>>;
}

const Appeal = (props: AppealProps) => {
  const [isVerifyDisabled, setIsVerifyDisabled] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (!isVerifyDisabled) {
      return;
    }
    if (timeLeft === 0) {
      setIsVerifyDisabled(false);
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isVerifyDisabled, timeLeft]);

  const getVeriCode = async (_email: string) => {
    request("/api/vericode_for_appeal", "POST", {
      email: _email,
    })
      .then(() => {
        message.success("验证码已发送到邮箱");
        setTimeLeft(60);
        setIsVerifyDisabled(true);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`发送失败，${error.response.data.message}`);
          console.log(error.response.data.message);
        } else {
          message.error(`发送失败，网络错误`);
        }
      })
      .finally(() => {
        setRefreshing(false);
        props.setrefreshing(false);
      });
  };

  const postAppeal = async (
    username: string,
    email: string,
    description: string,
    captcha: string
  ) => {
    request("/api/appeal", "POST", {
      username: username,
      email: email,
      description: description,
      captcha: captcha,
    })
      .then(() => {
        message.success("申诉发布成功");
      })
      .catch((error) => {
        if (error.response?.data.message) {
          message.error("申诉发布失败" + error.response?.data.message);
        } else {
          message.error("网络错误");
        }
      })
      .finally(() => {
        props.setrefreshing(false);
        setRefreshing(false);
      });
  };

  return (
    <Spin spinning={refreshing}>
      <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
        账号申诉
      </Typography>
      <Divider></Divider>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={(values) => {
          setRefreshing(true);
          props.setrefreshing(true);
          postAppeal(values.username, values.email, values.description, values.verticode);
        }}
        autoComplete="off"
        style={{ minWidth: "100%" }}
      >
        <p>若账号被封，你可以进行账号申诉，有概率解封或减小封禁时间。</p>
        <p>请输入您要申诉的账号用户名</p>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "不得为空",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value && getFieldValue("role") === "demander") {
                  return Promise.reject(new Error("注册需求方必填"));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <TextField fullWidth id="username" label="用户名" name="username" />
        </Form.Item>
        <p>请进行情况说明，管理员将根据你的说明和实际情况对你的账号作出处理</p>
        <Form.Item
          name="description"
          rules={[
            {
              required: true,
              message: "不得为空",
            },
          ]}
        >
          <TextField fullWidth id="description" label="情况说明" name="description" />
        </Form.Item>
        <p>为防止恶意申诉，你需要对邮箱进行验证</p>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "请输入正确的邮箱格式", type: "email" }]}
        >
          <Search
            placeholder="电子邮箱"
            allowClear
            onSearch={(value) => {
              if (value) {
                setRefreshing(true);
                props.setrefreshing(true);
                getVeriCode(value);
              } else {
                message.warning("邮箱不得为空");
              }
            }}
            enterButton={
              <Button type="link" disabled={isVerifyDisabled} style={{ width: "100%" }}>
                {isVerifyDisabled ? `${timeLeft < 10 ? 0 : ""}${timeLeft}s后重发` : "发送验证码"}
              </Button>
            }
            size="large"
          />
        </Form.Item>
        <Form.Item rules={[{ required: true, message: "验证码不能为空" }]} name="verticode">
          <TextField
            margin="normal"
            fullWidth
            id="verticode"
            label="验证码"
            name="verticode"
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
          申诉
        </Button>
      </Form>
    </Spin>
  );
};

export default Appeal;
