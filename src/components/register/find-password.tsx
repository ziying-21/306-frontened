import { request } from "@/utils/network";
import { isValid } from "@/utils/valid";
import { Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Button, Divider, Form, Input, message, Spin } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CryptoJS from "crypto-js";

interface FindPasswordProps {
  setrefreshing: Dispatch<SetStateAction<boolean>>;
}

const FindPassword = (props: FindPasswordProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isVerifyDisabled, setIsVerifyDisabled] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { Search } = Input;
  useEffect(() => {
    if (!isVerifyDisabled) {
      return;
    }
    if (timeLeft == 0) {
      setIsVerifyDisabled(false);
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isVerifyDisabled, timeLeft]);
  const getVeriCode = async (_email: string) => {
    request("/api/vericode_for_reset", "POST", {
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

  const resetPassword = async (
    username: string,
    email: string,
    captcha: string,
    hashedNewPassword: string
  ) => {
    request("/api/reset_password", "POST", {
      username: username,
      email: email,
      captcha: captcha,
      newpassword: hashedNewPassword,
    })
      .then(() => {
        message.success("重置密码成功");
      })
      .catch((error) => {
        if (error.response?.data) {
          message.error("重置密码失败" + error.response?.data.message);
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
        找回密码
      </Typography>
      <Divider />
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={(values) => {
          setRefreshing(true);
          props.setrefreshing(true);
          const hashPassword = CryptoJS.SHA256(values.newPassword).toString();
          resetPassword(values.username, values.email, values.vericode, hashPassword);
        }}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "用户名不能为空" },
            ({}) => ({
              validator(_, value) {
                if (!value || (isValid(value, true) && value.length <= 50 && value.length >= 3)) {
                  return Promise.resolve();
                }
                if (value && !isValid(value, true)) {
                  return Promise.reject(new Error("用户名只包含字母、数字、下划线"));
                }
                if (value && value.length > 50) {
                  return Promise.reject(new Error("用户名长度不超过50"));
                }
                if (value && value.length < 3) {
                  return Promise.reject(new Error("用户名长度不小于3"));
                }
              },
            }),
          ]}
        >
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="要找回密码对应的用户名"
            name="username"
            autoFocus
          />
        </Form.Item>

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
        <Form.Item rules={[{ required: true, message: "验证码不能为空" }]} name="vericode">
          <TextField
            margin="normal"
            fullWidth
            id="verticode"
            label="验证码"
            name="verticode"
            autoFocus
          />
        </Form.Item>
        <Form.Item rules={[{ required: true, message: "密码不能为空" }]} name="newPassword">
          <TextField
            margin="normal"
            fullWidth
            type="password"
            id="newPassword"
            label="新密码"
            name="newPassword"
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
          找回密码
        </Button>
      </Form>
    </Spin>
  );
};

export default FindPassword;
