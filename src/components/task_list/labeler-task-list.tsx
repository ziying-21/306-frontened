import { mapEntemplate2Zhtemplate } from "@/const/interface";
import store from "@/store";
import { request } from "@/utils/network";
import {
  Button,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
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
import axios from "axios";
import { useEffect, useState } from "react";
import { add } from "../task_manage/deleteList";
import { RcFile } from "antd/es/upload";
import Typography from "@mui/material/Typography";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Problem from "../demander_problem/problem";
import Grid from "@mui/material/Grid";
import { mapTemplate2Icon, transTime } from "@/utils/valid";

interface LabelerTaskListProps {
  state: string;
}

interface LabelerTask {
  demander_id: number;
  task_id: number;
  title: string;
  template: string;
  reward: number;
  deadline: number;
  task_data: any[];
  time: number;
}

const LabelerTaskList = (props: LabelerTaskListProps) => {
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  const [taskLists, setTaskLists] = useState<LabelerTask[]>([]);
  const [problemsModalOpen, setProblemsModalOpen] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [problemIndex, setProblemIndex] = useState<number>(0);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [detail, setDetail] = useState<LabelerTask>({
    title: "",
    template: "TextClassification",
    reward: 0,
    task_data: [],
    task_id: 0,
    demander_id: 0,
    deadline: 0,
    time: 0,
  });
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  useEffect(() => {
    request(`/api/${props.state}`, "GET")
      .then((response) => {
        setTaskLists(response.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取任务列表失败，${error.response.data.message}`);
        } else {
          message.error("获取任务列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);

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
        setReportLoading(false);
      });
  };
  const columns: ColumnsType<any> = [
    {
      title: "任务标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: "25%",
      filterDropdown: () => (
        <Input.Search placeholder="搜索任务标题" onChange={(e) => {setSearchTitle(e.target.value)}}/>
      ),
      filterIcon: (<SearchOutlined/>)
    },
    {
      title: "任务模板",
      dataIndex: "template",
      key: "template",
      align: "center",
      width: "25%",
      filters: [
        {
          text: "文本分类",
          value: "TextClassification",
        },
        {
          text: "图片分类",
          value: "ImagesClassification",
        },
        {
          text: "骨骼打点",
          value: "FaceTag",
        },
        {
          text: "图片框选",
          value: "ImageFrame",
        },
        {
          text: "音频标注",
          value: "SoundTag",
        },
        {
          text: "视频标注",
          value: "VideoTag",
        },
        {
          text: "文字三元组",
          value: "TextTriple"
        },
        {
          text: "文本审核",
          value: "TextReview"
        },
        {
          text: "音频审核",
          value: "AudioReview"
        },
        {
          text: "视频审核",
          value: "VideoReview"
        },
        {
          text: "图片审核",
          value: "ImageReview"
        },
        {
          text: "乱序重排",
          value: "SentenceSort"
        },
        {
          text: "自定义模板",
          value: "Custom"
        }
      ],
      onFilter: (values, record) => record.template=== values,
      render: (template) => <Tag color="blue" icon={mapTemplate2Icon(template)}>{mapEntemplate2Zhtemplate[template]}</Tag>,
    },
    {
      title: "任务奖励",
      dataIndex: "reward",
      key: "reward",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.reward - b.reward
    },
    {
      title: "举报与查看",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => (
        <>
          <Tooltip title="如果发现对方恶意审核，你可以举报">
          <Button
            type="link"
            onClick={() => {
              setDetail(record);
              setReportModalOpen(true);
            }}
            disabled={props.state!=="rejected"}
          >
            举报
          </Button>
          </Tooltip>
          <Tooltip title="点击此处查看我的标注">
          <Button
            disabled={record.task_data.length===0}
            type="link"
            onClick={() => {
              setDetail(record);
              setProblemsModalOpen(true);
            }}
          >
            我的标注
          </Button>
          </Tooltip>
          <Button type="link"
            onClick={() => {
              setDetail(record);
              setDetailModalOpen(true)
            }}
          >
            任务详情
          </Button>
        </>
      ),
    },
  ];

  let filteredData = taskLists;
  filteredData = taskLists.filter(
    (announcement) =>
  announcement.title.toLowerCase().includes(searchTitle.toLowerCase())
  )
  return (
    <>
      <Modal
        open={problemsModalOpen}
        onCancel={() => {
          setProblemsModalOpen(false);
          setProblemIndex(0);
        }}
        footer={null}
        destroyOnClose
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          题目详情
        </Typography>
        <Divider></Divider>
        <>
          <Problem
            problem={detail.task_data[problemIndex]}
            index={problemIndex}
            total={detail.task_data.length}
          />
          <Divider />
          <Grid container>
            <Grid item xs>
              <Tooltip title={problemIndex === 0 ? "已经是第一题了" : undefined}>
                <Button
                  disabled={problemIndex === 0}
                  onClick={() => {
                    // CarouselRef.current?.goTo(idx + 1, true);
                    setProblemIndex((i) => i - 1);
                  }}
                >
                  上一题
                </Button>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip
                title={
                  problemIndex === detail.task_data.length - 1 ? "已经是最后一题了" : undefined
                }
              >
                <Button
                  disabled={problemIndex === detail.task_data.length - 1}
                  onClick={() => {
                    setProblemIndex((i) => i + 1);
                  }}
                >
                  下一题
                </Button>
              </Tooltip>
              <Divider type="vertical" />
            </Grid>
            <Grid>
              <InputNumber
                size="small"
                placeholder={`跳转至`}
                value={pageNumber}
                onChange={(e) => {
                  setPageNumber(e);
                }}
              />
              <Button
                type="link"
                onClick={() => {
                  if (pageNumber !== null) {
                    if (pageNumber <= detail.task_data.length && pageNumber >= 1) {
                      setProblemIndex(pageNumber - 1);
                    } else {
                      message.warning(`请输入正确的题目序号1~${detail.task_data.length}`);
                    }
                  }
                }}
              >
                跳转至
              </Button>
            </Grid>
          </Grid>
        </>
      </Modal>
      <Modal
        open={reportModalOpen}
        onCancel={() => {
          setReportModalOpen(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Spin spinning={reportLoading} tip="举报发布中，请稍候...">
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          举报
        </Typography>
        <Divider></Divider>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setReportLoading(true);
            setLoading(true);
            const image_url = values.image_description.map((image: any) => image.response?.url);
            postReport(detail.task_id, detail.demander_id, values.description, image_url);
          }}
          autoComplete="off"
        >
          <p>如果您认为该需求方有恶意审核等行为，欢迎您对该需求方进行举报。</p>
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
          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
          >
            <Image alt="image" style={{ width: "100%" }} src={previewImage} />
          </Modal>
        </Form>
        </Spin>
      </Modal>
      <Modal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          任务详情
        </Typography>
        <Divider/>
        <Descriptions bordered column={4}>
          <Descriptions.Item label="标题" span={4}>
            {detail.title}
          </Descriptions.Item>
          <Descriptions.Item label="截止时间" span={4}>
            {transTime(detail.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label="模板" span={4}>
            <Tag color="blue" icon={mapTemplate2Icon(detail.template)}>{mapEntemplate2Zhtemplate[detail.template]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="任务奖励" span={4}>
            {detail.reward}
          </Descriptions.Item>
          <Descriptions.Item label="单题限时" span={4}>
            {detail.time}秒
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Table columns={columns} loading={refreshing || loading} dataSource={filteredData} pagination={{ pageSize: 10 }}/>
    </>
  );
};

export default LabelerTaskList;
