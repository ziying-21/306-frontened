import { mapEntemplate2Zhtemplate } from "@/const/interface";
import { downLoadZip, request } from "@/utils/network";
import { mapTemplate2Icon, transTime } from "@/utils/valid";
import { ProCard } from "@ant-design/pro-components"
import { Button, Descriptions, Divider, Form, Modal, Result, Spin, Tag, Tooltip, Upload, message } from "antd";
import { useEffect, useState } from "react"
import Label from "../../components/label";
import { InboxOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const { Dragger } = Upload;
const Test = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [hasNew, setHasNew] = useState<boolean>(false);
  const [labeling, setLabeling] = useState<boolean>(false);
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [newInfo, setNewInfo] = useState<any>({
    title: "",
    template: "TextClassification",
    time: 0,
    reward: 0,
    batch_file: "",
  });
  const [labelInfo, setLabelInfo] = useState<any>({
    title: "",
    template: "TextClassification",
    time: 0,
    reward: 0,
    batch_file: "",
  });
  const [hasLabeling, setHasLabeling] = useState<boolean>(false);
  const [Loading, setLoading] = useState<boolean>(false);
  const [problemList, setProblemList] = useState<any[]>([]);
  useEffect(() => {
    request("/api/distribute", "GET")
      .then((response) => {
        setHasNew(true);
        setNewInfo(response.data);
      })
      .catch((error) => {
        setHasNew(false);
      })
      .finally(() => {
        request("/api/labeling", "GET")
          .then(async (response) => {
            if (response.data.task) {
              setLabelInfo(response.data.task);
              setHasLabeling(true);
              await request("/api/temp_save", "GET")
                .then((res) => {
                  const problems = response.data.task.task_data;
                  if (res.data.answer.length !== 0) {
                    for (let i = 0; i < problems.length; i++) {
                      if (problems[i].template !== "SentenceSort") {
                        problems[i].data = res.data.answer[i].data;
                      } else if (res.data.answer[i].data) {
                        problems[i].data = res.data.answer[i].data;
                      }
                      // problems[i].data = res.data.answer[i].data;
                      problems[i].time = res.data.answer[i].time ? res.data.answer[i].time : 0
                      if (res.data.answer[i].data !== undefined && problems[i].template !== "SentenceSort") {
                        problems[i].time = Math.max(response.data.task.time, res.data.answer[i].time ? res.data.answer[i].time : 0);
                      }
                    }
                  }
                  setProblemList(problems);
                })
                .catch((error) => {
                  message.warning("获取暂存标注失败，请刷新重试");
                });
            } else {
              setHasLabeling(false);
            }
          })
          .catch(() => {
            message.warning("标注中任务获取失败，请刷新重试");
            setHasLabeling(false);
          })
          .finally(() => {
            setRefreshing(false);
          });
      });
  }, [refreshing]);

  const postAccRef = async (response: string) => {
    request("/api/task_status", "POST", {
      task_id: newInfo.task_id,
      response: response,
    })
      .then(() => {
        message.success("处理成功");
      })
      .catch((error) => {
        message.error("任务处理失败，请刷新后再试");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const postBatch = async (answer: string) => {
    request("/api/batch_load", "POST", {
      answer: answer,
    })
      .then(() => {
        message.success("批量标注结果提交成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`上传失败，${error.response.data.message}`);
        } else {
          message.error("上传失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  return labeling ? (
    <Label
      setLabeling={setLabeling}
      problemList={problemList}
      task_id={labelInfo.task_id}
      template={labelInfo.template}
      time={labelInfo.time}
      setRefreshing={setRefreshing}
      deadline={labelInfo.deadline}
    />
  ) : (
    <>
      <Spin
        spinning={refreshing || Loading}
        tip={refreshing ? "正在获取任务，请稍后..." : "正在处理，请稍后..."}
      >
        <ProCard split="vertical">
          <ProCard colSpan={"50%"}>
            <h1 style={{ textAlign: "center" }}>新任务</h1>
            {hasNew ? (
              <>
                <Descriptions bordered column={4}>
                  <Descriptions.Item label="任务标题" span={4}>
                    <Tooltip title="点击此处下载题目文件">
                      {newInfo.title}
                    </Tooltip>
                  </Descriptions.Item>
                  <Descriptions.Item label="任务模板" span={4}>
                    <Tag color="blue" icon={mapTemplate2Icon(newInfo.template)}>{mapEntemplate2Zhtemplate[newInfo.template]}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="任务奖励" span={4}>
                    {newInfo.reward}秒
                  </Descriptions.Item>
                  <Descriptions.Item label="单题限时" span={4}>
                    {newInfo.time}秒
                  </Descriptions.Item>
                  <Descriptions.Item label="截至时间" span={4}>
                    {transTime(newInfo.deadline)}
                  </Descriptions.Item>
                </Descriptions>
                <br />
                <Grid container>
                  <Grid xs></Grid>
                  <Grid>
                  <Button size="large" style={{
                      backgroundColor: "#3b5999",
                      color: "white",
                    }}
                      onClick={() => {
                        setLoading(true);
                        downLoadZip(newInfo.batch_file.slice(0, -4) + "_clean.zip", setLoading)
                      }}
                    >
                      下载题目数据文件
                    </Button>
                    <Divider type="vertical"/>
                    <Button size="large" style={{
                      backgroundColor: "#3b5999",
                      color: "white",
                    }}
                      onClick={() => {
                        setLoading(true);
                        postAccRef("ok");
                      }}
                    >
                      接受
                    </Button>
                    <Divider type="vertical" />
                    <Button
                      size="large"
                      style={{
                        backgroundColor: "#3b5999",
                        color: "white",
                      }}
                      onClick={() => {
                        setLoading(true);
                        postAccRef("no");
                      }}
                    >
                      拒绝
                    </Button>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Result status="404" title="暂时没有新任务" />
            )}
          </ProCard>
          <ProCard colSpan={"50%"}>
            <h1 style={{ textAlign: "center" }}>标注中任务</h1>
            {hasLabeling ? (
              <>
                <Descriptions bordered column={4}>
                  <Descriptions.Item label="任务标题" span={4}>
                    <Tooltip title="点击此处下载题目文件">
                      {labelInfo.title}
                    </Tooltip>
                  </Descriptions.Item>
                  <Descriptions.Item label="任务模板" span={4}>
                    <Tag color="blue" icon={mapTemplate2Icon(labelInfo.template)}>{mapEntemplate2Zhtemplate[labelInfo.template]}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="任务奖励" span={2}>
                    {labelInfo.reward}
                  </Descriptions.Item>
                  <Descriptions.Item label="单题限时" span={2}>
                    {labelInfo.time}
                  </Descriptions.Item>
                  <Descriptions.Item label="截至时间" span={4}>
                    {transTime(labelInfo.deadline)}
                  </Descriptions.Item>
                </Descriptions>
                <Divider />
                <Form
                  name="basic"
                  initialValues={{ remember: true }}
                  onFinish={(values) => {
                    // console.log(values.batch_file[0].response.url);
                    setLoading(true);
                    postBatch(values.batch_file[0].response.url);
                  }}
                  autoComplete="off"
                >
                  <Form.Item
                    name="batch_file"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                    rules={[{ required: true, message: "请上传压缩包" }]}
                  >
                    <Dragger
                      action="/api/file"
                      headers={{ Authorization: `Bearer ${localStorage.getItem("token")}` }}
                      maxCount={1}
                      beforeUpload={() => {
                        setLoading(true);
                        return true;
                      }}
                      onChange={(info) => {
                        if (info.file.status === "done") {
                          setLoading(false);
                          message.success("上传成功");
                        } else if (info.file.status === "error") {
                          setLoading(false);
                          message.error("上传失败");
                        }
                      }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">将带标注的Excel文件拖拽到这里，然后点击下面的按钮上传</p>
                    </Dragger>
                  </Form.Item>
                  <Form.Item>
                    <Button style={{
                      backgroundColor: "#3b5999",
                      color: "white",
                    }}
                      size="large"
                      onClick={() => {
                        setLoading(true);
                        downLoadZip(labelInfo.batch_file.slice(0, -4) + "_clean.zip", setLoading)
                      }}
                    >
                      下载标注文件
                    </Button>
                    <Divider type="vertical" />
                    <Button style={{
                      backgroundColor: "#3b5999",
                      color: "white",
                    }}
                      size="large"
                      type="primary"
                      htmlType="submit"
                    >
                      上传标注数据
                    </Button>
                    <Divider type="vertical" />
                    <Button
                      size="large"
                      style={{
                        backgroundColor: "#3b5999",
                        color: "white",
                      }}
                      onClick={() => {
                        setLabeling(true);
                      }}
                    >
                      开始逐题标注
                    </Button>
                    <Divider type="vertical"/>
                    <Tooltip title="什么是批量标注">
                      <Button type="text" icon={<QuestionCircleOutlined />} size="small" onClick={() => {setBatchModalOpen(true)}}/>
                    </Tooltip>
                  </Form.Item>
                </Form>
              </>
            ) : (
              <Result status="404" title="暂时没有标注中任务" />
            )}
          </ProCard>
        </ProCard>
        <Modal open={batchModalOpen} onCancel={() => {setBatchModalOpen(false)}} footer={null} centered>
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          批量标注说明
        </Typography>
        <Divider/>
        除了在线逐题标注外，您可以选择使用excel文件进行批量标注。步骤如下:
        <ol>
        <li>
          点击“下载标注文件”按钮下载模板Excel文件。
        </li>
        <li>
          根据Excel文件中的样例规范在正确的位置填写你的标注结果。
        </li>
        <li>
          将含有你的标注结果的Excel文件拖拽到上传框中上传。
        </li>
        <li>
          点击“上传标注数据”按钮即可确认上传。
        </li>
        </ol>
        <b>注意：</b>
        <ol>
          <li>您在Excel中标注任意数量的题目即可上传。</li>
          <li>Excel文件中的“参考答案”列是需求方上传带标注数据的地方，在您下载的Excel文件中该列的信息已经被剔除，请不要试图以此来推测需求方的自动审核策略。</li>
          <li>进行逐题标注时您以前的标注结果会自动加载。</li>
          <li>每次下载的Excel文件中将不会加载以前的标注，请注意本地保存您的批量上传文件。</li>
          <li>您通过Excel进行的标注不会作为最终提交；无论您是批量标注还是逐题标注，您都需要点击“开始逐题标注”按钮进入标注界面，再点击“提交”按钮才会最终提交您的标注。</li>
          <li>批量标注没有最低时限要求，您每次上传批量标注结果，该任务的所有题目的时长都将被设置为该任务要求的最低时限，这是因为不是所有题目都必须填写标注（如图片分类任务中可能没有一个选项符合题干所述条件），平台无法判断某一题是没有标注还是本身就没有答案，为了保证您的标注体验，我们采取了这种策略。</li>
          <li>请不要单纯为了逃避时限而使用批量标注；需求方将对你的标注进行审核，质量过低的标注将不予采用，此时您将得不到点数奖励并面临信用分惩罚。</li>
        </ol>
        </Modal>
      </Spin>
    </>
  );
};

export default Test;
