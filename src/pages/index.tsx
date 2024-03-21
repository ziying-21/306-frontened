import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Form, message, Button, Spin, Modal, Divider } from "antd";
import { isValid } from "@/utils/valid";
import { useRouter } from "next/router";
import CryptoJS from "crypto-js";
import Register from "@/components/register/register";
import { request } from "@/utils/network";
import FindPassword from "@/components/register/find-password";
import CameraButton from "@/components/CameraVideo";
import axios from "axios";
import Appeal from "@/components/register/appeal";

interface LoginScreenPorps {
  setRole: Dispatch<SetStateAction<string | null>>;
}

export default function LoginScreen(props: LoginScreenPorps) {
  const router = useRouter();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isFoundPassword, setIsFoundPassword] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [faceModal, setFaceModal] = useState(false);
  const [faceModalLoading, setFaceModalLoading] = useState(false);
  const [AppealModalOpen, setAppealModalOpen] = useState<boolean>(false);
  const [userAgreement, setUserAgreement] = useState<boolean>(false);
  const CarouselRef = useRef<any>(null);

  const faceLogin = (faceImg: File): Promise<void> =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("face_image", faceImg);
      axios
        .post("/api/user/verify", formData)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.role);
          props.setRole(response.data.role);
          router.push(`/${response.data.role}/info`);
          message.success("登录成功");
          resolve();
        })
        .catch((error) => {
          if (error.response) {
            message.error(`登录失败，${error?.response?.data?.message}`);
          } else {
            message.error("网络失败，请稍后再试");
          }
          reject();
        })
        .finally(() => {
          setRefreshing(false);
        });
    });

  const login = async (values: { username: string; hashPassword: string; }) => {
    request("/api/user/login", "POST", {
      username: values.username,
      password: values.hashPassword,
    })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user_id", response.data.user_id);
        props.setRole(response.data.role);
        router.push(`/${response.data.role}/info`);
        message.success("登录成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`登录失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  };
  return (
    <Spin spinning={refreshing} tip="加载中，请稍后">
      <Modal
        open={isRegisterModalOpen}
        onCancel={() => {
          if (!refreshing) {
            setIsRegisterModalOpen(false);
          }
        }}
        footer={false}
        destroyOnClose={true}
        centered
      >
        <Register setModalOpen={setIsRegisterModalOpen} CarouselRef={CarouselRef} />
      </Modal>

      <Modal open={faceModal} onCancel={() => setFaceModal(false)} footer={null} destroyOnClose>
        <Spin spinning={faceModalLoading} tip="图片上传中，请稍候">
          <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
            脸部识别登录
          </Typography>
          <CameraButton
            fileName="face.jpg"
            onFinish={(faceImg) => {
              setFaceModalLoading(true);
              faceLogin(faceImg)
                .then(() => setFaceModal(false))
                .finally(() => setFaceModalLoading(false));
            }}
          />
        </Spin>
      </Modal>

      <Modal
        open={isFoundPassword}
        onCancel={() => {
          if (!refreshing) {
            setIsFoundPassword(false);
          }
        }}
        footer={null}
        destroyOnClose
      >
        <FindPassword setrefreshing={setRefreshing} />
      </Modal>

      <Modal
        open={userAgreement}
        onCancel={() => setUserAgreement(false)}
        footer={null}
      >
        <h2 style={{textAlign: "center"}}>用户服务协议</h2>
        本用户服务协议（以下简称“协议”）是您（以下简称“用户”或“您”）与众包平台（以下简称“平台”或“我们”）之间就使
        用平台所提供的服务所订立的协议。在使用平台的服务前，请您仔细阅读本协议的所有条款和条件。通过访问、注册、使用
        或以其他方式接受本平台提供的服务，即表示您同意受本协议的约束。如果您不同意本协议的任何条款，请勿使用平台的服务。
        服务描述 <br />
        1.1 平台提供的服务是基于互联网的众包服务，旨在连接需求方（以下简称“雇主”）和服务提供方（以下简称“参与者”）。 <br />
        1.2 雇主可以发布任务或项目需求，参与者可以自愿选择参与相关任务或项目的执行。<br />
        1.3 平台提供的服务包括但不限于任务发布、参与者招募、任务执行管理、交流工具等。具体服务内容以平台提供的相关页面或功能说明为准。<br />
        用户注册和账户安全<br />
        2.1 用户必须注册并创建个人账户才能使用平台的服务。在注册过程中，用户需要提供真实、准确、完整的个人信息，并确保及时更新这些信息。<br />
        2.2 用户应当对其账户和密码的安全负责，并对使用其账户和密码进行的所有活动承担责任。如发现账户或密码被未经授权的使用或存在安全漏洞，用户应立即通知平台。<br />
        2.3 用户不得以任何形式转让、出租、借用或共享其账户给其他人使用。<br />
        用户权利与义务<br />
        3.1 用户有权根据平台的规定使用平台提供的服务，并享受与之相应的权益。<br />
        3.2 用户应遵守平台的规则和政策，不得利用平台从事任何违法、欺诈、侵权、虚假宣传等活动，不得干扰、破坏平台的正常运行。<br />
        3.3 用户应保护平台及其他用户的合法权益，不得故意损害其他用户或平台的声誉，不得传播违法、有害、威胁、辱骂、诽谤等不良信息。<br />
        3.4 用户应自行承担使用平台服务所产生的费用，并按时支付相关费用。<br />
        3.5 用户不得利用平台进行违法活动或违法交易，包括但不限于洗钱、赌博、贩卖非法物品等。<br />
        任务发布与执行<br />
        4.1 雇主可以根据需要发布任务或项目需求，并提供详细的任务描述、要求、报酬等信息。<br />
        4.2 参与者可以自愿选择参与相关任务的执行，并按照雇主的要求完成任务。<br />
        4.3 雇主和参与者应按照诚实信用的原则进行合作，保证所提供的信息真实、准确、完整，履行双方约定的义务。<br />
        4.4 平台仅提供任务发布和参与者招募的中介服务，不对任务的执行质量、结果承担责任。<br />
        知识产权保护<br />
        5.1 平台尊重知识产权，用户在使用平台服务过程中所涉及的任何文字、图片、音频、视频等作品，应保证其拥有合法的权利或获得了合法授权。<br />
        5.2 用户不得在平台上发布、传播侵犯他人知识产权的内容，包括但不限于盗版软件、盗版音视频、侵权图片等。<br />
        隐私保护<br />
        6.1 平台将按照相关法律法规和隐私政策的规定收集、存储和使用用户的个人信息，并采取合理的安全措施保护用户的个人信息安全。<br />
        6.2 用户同意平台可以根据业务需要将用户的个人信息提供给与平台合作的第三方，但平台会要求第三方对用户个人信息的保密进行合理的安全措施。<br />
        6.3 用户有权访问、修改、删除其个人信息，并可以随时关闭其账户。<br />
        免责条款<br />
        7.1 平台仅为用户提供任务发布和参与者招募的中介服务，不对雇主的任务需求和参与者的执行能力、结果承担责任。<br />
        7.2 平台不对因用户违反本协议或相关法律法规而导致的任何损失承担责任。<br />
        7.3 平台不对由于不可抗力、计算机病毒、黑客攻击、系统故障等不可预见和不可避免的情况而造成的任何损失承担责任。<br />
        协议的变更和终止<br />
        8.1 平台有权根据业务需要随时修改本协议的条款，并通过平台公示的方式通知用户。用户在协议变更后继续使用平台服务即视为接受变更后的协议。<br />
        8.2 平台有权在提前通知的情况下终止向用户提供服务，如用户违反本协议或平台的规则和政策，或平台决定停止运营等。<br />
        法律适用和争议解决<br />
        9.1 本协议的签订、生效、解释、执行和争议解决适用中国法律。<br />
        9.2 如发生本协议的争议，双方应通过友好协商解决；协商不成的，任何一方均有权将争议提交至有管辖权的人民法院解决。<br />
        其他条款<br />
        10.1 如本协议的任何条款被视为无效或不可执行，不影响其他条款的有效性和可执行性。<br />
        10.2 本协议构成用户和平台之间的完整协议，取代双方先前就相同事项达成的任何口头或书面约定。<br />
        请您在使用平台服务之前认真阅读并理解本用户服务协议的所有条款和条件。如有任何疑问，请随时联系平台客服。<br />
      </Modal>

      <Modal
        open={AppealModalOpen}
        onCancel={() => {
          if (!refreshing) {
            setAppealModalOpen(false);
          }
        }}
        footer={null}
        destroyOnClose
      >
        <Appeal setrefreshing={setRefreshing} />
      </Modal>

      <Grid container component="main" sx={{ height: "100vh" }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(/logo/306.png)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square 
          style={{
            height: "100vh",
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            style={{
              marginTop: "50vh",
              transform: "translate(0, -50%)",
            }}
          >
            {/* <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <PersonIcon />
            </Avatar> */}
            <Typography component="h1" variant="h5">
              登录
            </Typography>
            <Divider />
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={(values) => {
                setRefreshing(true);
                const hashPassword = CryptoJS.SHA256(values.password).toString();
                login({ username: values.username, hashPassword: hashPassword });
              }}
              autoComplete="off"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "用户名不能为空" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        !value ||
                        (isValid(value, true) && value.length <= 50 && value.length >= 3)
                      ) {
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
                  label="用户名"
                  name="username"
                  autoFocus
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "密码不能为空" },
                  ({ }) => ({
                    validator(_, value) {
                      if (
                        !value ||
                        (isValid(value, true) && value.length <= 50 && value.length >= 3)
                      ) {
                        return Promise.resolve();
                      }
                      if (value && !isValid(value, true)) {
                        return Promise.reject(new Error("密码只包含字母、数字、下划线"));
                      }
                      if (value && value.length > 50) {
                        return Promise.reject(new Error("密码长度不超过50"));
                      }
                      if (value && value.length < 3) {
                        return Promise.reject(new Error("密码长度不小于3"));
                      }
                    },
                  }),
                ]}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  name="password"
                  label="密码"
                  type="password"
                  id="password"
                />
              </Form.Item>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label={
                  <>
                    我已阅读并同意
                    <b style={{ color: "#1677ff" }} onClick={() => setUserAgreement(true)} >
                      用户服务协议
                    </b>
                  </>
                }
                required
              />
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
                登录
              </Button>
              <Grid container>
                <Grid item xs>
                  <Button
                    type="link"
                    onClick={() => {
                      setIsFoundPassword(true);
                    }}
                  >
                    忘记密码?
                  </Button>
                </Grid>
                <Grid item>
                  <Button type="link" onClick={() => setFaceModal(true)}>
                    人脸验证登录
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="link"
                    onClick={() => {
                      setAppealModalOpen(true);
                    }}
                  >
                    申诉
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="link"
                    onClick={() => {
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    注册验证
                  </Button>
                </Grid>
              </Grid>
            </Form>
          </Box>
        </Grid>
      </Grid>
    </Spin>
  );
}
