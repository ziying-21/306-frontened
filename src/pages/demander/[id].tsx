import CheckModel from "@/components/check/checkModel";
import { DemanderTaskTableEntry } from "@/components/task_list/demander-task-list";
import { add } from "@/components/task_manage/deleteList";
import { mapState2ColorChinese } from "@/const/interface";
import { request } from "@/utils/network";

import {
  Button,
  Divider,
  Form,
  Image,
  Modal,
  Popconfirm,
  Slider,
  Spin,
  Table,
  Tag,
  Tooltip,
  Upload,
  UploadFile,
  UploadProps,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import store from "@/store";
import axios from "axios";
import { RcFile } from "antd/es/upload";
import { PlusOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const TasktaskScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [slideValue, setSlideValue] = useState<number>(1);
  const [slideAccuracyValue, setSlideAccuracyValue] = useState<number>(1);
  const [isLabelerList, setIsLabelerList] = useState<boolean>(true);
  const [labelerId, setLabelerId] = useState<number>(-1);
  const [isSample, setIsSample] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [task, setTask] = useState<DemanderTaskTableEntry>({
    task_id: -1,
    create_at: 0,
    deadline: 0,
    title: "标题五个字",
    state: [],
    reward: 0,
    time: 0,
    labeler_number: 0,
    labeler_id: [],
    template: "TextClassification",
    labeler_state: [],
    pass_check: false,
    labeler_credits: [],
    distribute: "agent",
    distribute_type: "order",
    agent_username: "中介名称五个字",
    type: "event",
    priority: 0,
  });
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    request(`/api/demander/task?task_id=${query.id}`, "GET")
      .then((response) => {
        setTask(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取任务信息失败，${error.response.data.message}`);
        } else {
          message.error("获取任务信息失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);

  // 对某一标注者进行自动审核
  const postSingleAutoChecking = async (task_id: number, labeler_id: number, accuracy: number) => {
    request("/api/demander/single_auto_check", "POST", {
      task_id: task_id,
      labeler_id: labeler_id,
      accuracy: accuracy,
    })
      .then(() => {
        message.success("自动审核请求发送成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`自动审核请求发送失败，${error.response.data.message}`);
        } else {
          message.error("自动审核请求发送失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  // 发布举报
  const postReport = async (
    task_id: number,
    user_id: number,
    description: string,
    image_description: string[]
  ) => {
    request("/api/report", "POST", {
      task_id: task_id,
      user_id: user_id,
      description: description,
      image_description: image_description,
    })
      .then(() => {
        message.success("举报发送成功");
        setReportModalOpen(false);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`举报发送失败，${error.response.data.message}`);
        } else {
          message.error("举报发送失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };

  const UploadPropsByType = (fileType: "image" | "video" | "audio"): UploadProps => ({
    action: "/api/file",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    beforeUpload: (file) => {
      console.log(file.type);
      const isValid = file.type.startsWith(fileType);
      if (!isValid) {
        message.error(`${file.name} 文件格式错误`);
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(`${file.name} 文件大小超过2MB`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onRemove: async (file) => {
      console.log("file", file);
      store.dispatch(add(file.response?.url || file.url));
      return true;
    },
  });

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    console.log("handlePreview");
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    if (file.url && !file.preview) {
      console.log(file.url);
      file.preview = await getBase64(
        (
          await axios.get("/api/file", {
            responseType: "arraybuffer",
            params: { url: file.url },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
        ).data
      );
    }
    setPreviewImage(file.preview as string);
    setPreviewOpen(true);
    setPreviewTitle(file.name);
  };

  const LabelerTableColumns: ColumnsType<any> = [
    {
      title: "标注者编号",
      dataIndex: "labeler_id",
      key: "labeler_id",
      align: "center",
      width: "25%",
    },
    {
      title: "标注者状态",
      dataIndex: "labeler_state",
      key: "labeler_state",
      align: "center",
      width: "25%",
      render: (state, record) => {
        return (
          <Tooltip title={mapState2ColorChinese[state].show}>
            <Tag color={mapState2ColorChinese[state].color}>
              {mapState2ColorChinese[state].description}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "审核与举报",
      dataIndex: "labeler_detail",
      key: "labeler_detail",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="处于待审核状态可以审核，你也可以通过这里查看某个标注方的标注">
              <Button
                type="link"
                disabled={
                  record.labeler_state !== 3 &&
                  record.labeler_state !== 4 &&
                  record.labeler_state !== 5
                }
                onClick={() => {
                  setIsChecking(record.labeler_state === 3);
                  setLabelerId(record.labeler_id);
                  setIsSample(false);
                  setIsLabelerList(false);
                }}
              >
                全量审核
              </Button>
            </Tooltip>
            <Tooltip title="处于待审核状态可以审核">
              <Popconfirm
                disabled={record.labeler_state !== 3}
                placement="bottom"
                title="抽样审核"
                okText="确认"
                cancelText="取消"
                description={
                  <>
                    请选择抽样百分比（%）
                    <Slider
                      onChange={(value) => {
                        setSlideValue(value);
                      }}
                      value={slideValue}
                      min={1}
                      max={100}
                    />
                  </>
                }
                onConfirm={() => {
                  setIsChecking(record.labeler_state === 3);
                  setLabelerId(record.labeler_id);
                  setIsSample(true);
                  setIsLabelerList(false);
                }}
              >
                <Button type="link" disabled={record.labeler_state !== 3}>
                  抽样审核
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="对该用户单独进行自动审核">
              <Popconfirm
                disabled={record.labeler_state !== 3}
                placement="bottom"
                title="自动审核"
                okText="确认"
                cancelText="取消"
                description={
                  <>
                    <p>
                      该标注方的信用分为{record.labeler_credits}，
                      {record.credits < 80 ? "用户信用分较低，不建议进行自动审核" : "可以自动审核"}
                      ，确定要自动审核吗?
                    </p>
                    <p>若要自动审核，请先指定下面的正确率标准</p>
                    <Slider
                      onChange={(value) => {
                        setSlideAccuracyValue(value);
                      }}
                      value={slideAccuracyValue}
                      min={1}
                      max={100}
                    />
                  </>
                }
                onConfirm={() => {
                  setLoading(true)
                  postSingleAutoChecking(task.task_id, record.labeler_id, slideAccuracyValue);
                }}
              >
                <Button disabled={record.labeler_state !== 3} type="link">
                  自动审核
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="你可以对不合格的标注方进行举报">
              <Button
                type="link"
                disabled={record.labeler_state !== 5}
                onClick={() => {
                  setLabelerId(record.labeler_id);
                  setReportModalOpen(true);
                }}
              >
                举报
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];
  const query = router.query;
  return (
    <div
      style={{
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <Spin spinning={refreshing || loading}>
        {isLabelerList ? (
          <>
            <Table
              columns={LabelerTableColumns}
              dataSource={task.labeler_id.map((id, idx) => {
                return {
                  labeler_id: id,
                  labeler_state: task.labeler_state[idx],
                  labeler_credits: task.labeler_credits[idx],
                };
              })}
              pagination={{ pageSize: 5 }}
            />
          </>
        ) : (
          <>
            <CheckModel
              task_id={task.task_id}
              labeler_index={labelerId}
              is_sample={isSample}
              template={task.template}
              rate={slideValue}
              setIsLabelerList={setIsLabelerList}
              setRefreshing={setRefreshing}
              is_checking={isChecking}
            />
          </>
        )}
        <Modal
          open={reportModalOpen}
          onCancel={() => {
            setReportModalOpen(false);
          }}
          footer={null}
          destroyOnClose
        >
          <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
            举报
          </Typography>
          <Divider></Divider>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={(values) => {
              setLoading(true);
              const image_url = values.image_description.map((image: any) => image.response?.url);
              postReport(task.task_id, labelerId, values.description, image_url);
              setReportModalOpen(false);
            }}
            autoComplete="off"
          >
            <p>如果您认为该标注者有恶意刷题等行为，欢迎您对该标注者进行举报。</p>
            <p>
              <b>注:</b>{" "}
              请勿恶意进行举报，若管理员发现您有恶意举报行为，可能会驳回您的举报并扣除您的信用分
            </p>
            <p>
              请对被举报者的恶意行为进行<b>说明</b>，您的描述越详尽，举报成功的概率越高
            </p>
            <Form.Item name="description" rules={[{ required: true, message: "说明不能为空" }]}>
              <TextField
                name="description"
                fullWidth
                id="description"
                label="原因说明"
                autoFocus
                type="description"
                multiline
              />
            </Form.Item>
            <p>
              请提供<b>图片证据</b>，图片证据越详尽，举报成功的概率越高
            </p>
            <Form.Item
              name="image_description"
              rules={[{ required: true, message: "请上传文件" }]}
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                console.log(e);
                return e?.fileList;
              }}
            >
              <Upload
                {...UploadPropsByType("image")}
                listType="picture-card"
                onPreview={handlePreview}
              >
                <PlusOutlined style={{ fontSize: "24px" }} />
              </Upload>
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
              发布举报
            </Button>
          </Form>
        </Modal>
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <Image alt="image" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </Spin>
    </div>
  );
};

export default TasktaskScreen;
