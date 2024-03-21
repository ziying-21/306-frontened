import { ImagesClassificationProblem, TagProblem, TaskInfo } from "@/const/interface";
import {
  Form,
  message,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Button,
  Divider,
  ConfigProvider,
  Image,
  Space,
  Select,
  Alert,
  Upload,
  Radio,
  Tooltip,
} from "antd";
import type { UploadFile, SelectProps } from "antd";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import locale from "antd/locale/zh_CN";
import {
  FaceTagDataForm,
  FileReviewDataForm,
  ImageFrameDataForm,
  ImagesClassificationDataForm,
  SoundTagDataForm,
  TextClassificationDataForm,
  TextReviewDataForm,
  VideoTagDataForm,
} from "./task-data-form";
import {
  DeleteOutlined,
  InboxOutlined,
  QuestionCircleOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { Modal } from "antd/lib";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { clear } from "./deleteList";
import Typography from "@mui/material/Typography";

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const downloadTemplate = (type: TaskInfo["template"]) => {
  console.log(type);
  if (type === undefined) {
    message.error("请先选择模板");
    return;
  }
  const link = document.createElement("a");
  link.href = `/template/${type}.xlsx`;
  link.download = `${type}.xlsx`;
  link.click();
};

const selectOptions: SelectProps<TaskInfo["template"]>["options"] = [
  { value: "TextClassification", label: "文字分类" },
  { value: "ImagesClassification", label: "图片分类" },
  { value: "FaceTag", label: "人脸骨骼打点" },
  { value: "ImageFrame", label: "图片框选" },
  { value: "SoundTag", label: "语音标注" },
  { value: "VideoTag", label: "视频标注" },
  { value: "Custom", label: "自定义组合模板(仅支持批量上传)" },
  { value: "TextTriple", label: "文字三元组" },
  { value: "SentenceSort", label: "乱序重排" },
  {
    label: "审核",
    options: [
      { label: "文字审核", value: "TextReview" },
      { label: "图片审核", value: "ImageReview" },
      { label: "视频审核", value: "VideoReview" },
      { label: "音频审核", value: "AudioReview" },
    ],
  },
];

export interface TaskInfoFormProps {
  taskInfo?: TaskInfo;
  onFinish: (info: TaskInfo) => Promise<void>;
}

/**
 * 任务信息表单组件
 * @param props.taskInfo 任务信息
 * @param props.onFinish 表单提交时的回调函数
 * @returns 任务信息表单组件
 * @private
 */
const TaskInfoForm: React.FC<TaskInfoFormProps> = (props) => {
  const deleteList = useAppSelector((state) => state.deleteList.value);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [agentList, setAgentList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [form] = Form.useForm<TaskInfo>();
  const [downloadingZip, setDownloadingZip] = useState(false);
  // const batch = Form.useWatch("batch", form);
  const [batch, _] = useState<boolean>(true);
  const template = Form.useWatch("template", form);
  const distribute = Form.useWatch("distribute", form);

  useEffect(() => {
    form.setFieldValue("task_data", undefined);
  }, [batch, form]);

  useEffect(() => {
    form.setFieldValue("distribute_type", undefined);
    form.setFieldValue("agent_username", undefined);
  }, [distribute, form]);

  useEffect(() => {
    axios
      .get("/api/get_agent", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((value) => setAgentList(value.data.data))
      .catch((reason) => message.error(`获取中介失败 ${reason.message}`));
  }, []);

  useEffect(() => {
    console.log(props.taskInfo);
    if (props.taskInfo) {
      form.setFieldsValue({
        ...props.taskInfo,
        deadline: dayjs(props.taskInfo.deadline) as any,
        batch_file: props.taskInfo.batch_file
          ? ([
            {
              uid: 1,
              name: props.taskInfo.batch_file,
              status: "done",
              url: props.taskInfo.batch_file,
            },
          ] as any)
          : undefined,
      });
    }
    console.log(form.getFieldsValue());
  }, [props.taskInfo, form]);

  const onFinish = () => {
    setLoading(true);
    const value = form.getFieldsValue();
    console.log("onFinish", value);
    const deadline = (value.deadline as unknown as dayjs.Dayjs).valueOf();
    let task_data: typeof value.task_data = [];
    if (batch) {
      // task_data = (value.task_data as unknown as UploadFile[])[0]?.response?.url;
      value.batch_file = (value.batch_file as unknown as UploadFile[])[0]?.response?.url ?? (value.batch_file as unknown as UploadFile[])[0]?.url;
    } else if (value.template === "TextClassification") {
      task_data = value.task_data;
    } else if (value.template === "ImagesClassification") {
      task_data = (value.task_data as ImagesClassificationProblem[]).map((v) => ({
        ...v,
        options: v.options.map((x: any) => x?.response?.url),
      }));
    } else if (
      value.template === "ImageFrame" ||
      value.template === "FaceTag" ||
      value.template === "SoundTag" ||
      value.template === "VideoTag"
    ) {
      task_data = (value.task_data as TagProblem[]).map((v) => ({
        ...v,
        url: (v.url[0] as any)?.response?.url,
      }));
    }
    props
      .onFinish({ ...value, deadline, task_data, batch })
      .then(() => {
        deleteList.forEach((url) => {
          axios.delete("/api/file", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            params: { url },
          });
        });
        dispatch(clear());
        form.resetFields();
      })
      .finally(() => setLoading(false));
  };

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

  return (
    <ConfigProvider locale={locale}>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image alt="image" style={{ width: "100%" }} src={previewImage} />
      </Modal>
      <Form
        form={form}
        onFinishFailed={() => {
          message.error("请检查表单是否填写完整");
        }}
        onFinish={onFinish}
      >
        {/* <Row>
          <Col span={12}> */}
        <Form.Item
          label="任务标题"
          name="title"
          rules={[{ required: true, message: "请输入任务标题" }]}
        >
          <Input/>
        </Form.Item>
        {/* </Col>
        </Row> */}
        {/* <Row> */}
        {/* <Col span={6}> */}
        <Form.Item
          label="任务模板"
          name="template"
          rules={[{ required: true, message: "请选择任务模板" }]}
        >
          <Select
            onChange={(v) => {
              form.setFieldValue("task_data", []);
            }}
            options={selectOptions}
          />
        </Form.Item>
        <Form.Item
          label="任务内容分类标签"
          name="type"
          rules={[{ required: true, message: "请选择任务内容分类标签" }]}
        >
          <Select
            options={[
              { value: "sentiment", label: "情感分类、分析" },
              { value: "part-of-speech", label: "词性分类" },
              { value: "intent", label: "意图揣测" },
              { value: "event", label: "事件概括" },
            ]}
          />
        </Form.Item>
        <Row>
        <Form.Item
          label="任务奖励"
          name="reward"
          rules={[{ required: true, message: "请输入任务奖励" }]}
          style={{marginRight: 7}}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="标注方人数"
          name="labeler_number"
          rules={[{ required: true, message: "请输入标注方人数" }]}
          style={{marginRight: 7}}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="单题限时"
          name="time"
          rules={[{ required: true, message: "请输入单题限时" }]}
        >
          <InputNumber min={0} addonAfter="秒" />
        </Form.Item>
        </Row>
        {/* </Col>
        </Row> */}
        <Form.Item
          label="分发方式"
          name="distribute"
          rules={[{ required: true, message: "请选择分发方式" }]}
        >
          <Radio.Group>
            <Radio.Button value="system">系统分发</Radio.Button>
            <Radio.Button value="agent">中介分发</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {distribute === "system" && (
          <>
            <Form.Item
              label="优先级花费"
              name="priority"
              rules={[{ required: true, message: "请输入优先级花费" }]}
              initialValue={0}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Row>
              <Space>
                <Col>
                  <Form.Item
                    label={
                      <>
                        系统分发方式
                        <Divider type="vertical" />
                        <Tooltip
                          title={
                            <>
                              <p>分发模式决定了系统优先将任务派发给哪个用户</p>
                              <p>顺序分发：系统按照注册成功顺序从早到晚依次派发。</p>
                              <p>智能分发：系统考虑用户信用分、积分、经验、用户喜好（优先级从高到低）后分发。</p>
                              <p>预计正确率最高分发：系统考虑用户信用分、标注成功率、标注所得积分（优先级由高到低）后分发。</p>
                              <p>预计标注时间最短分发：系统考虑用户信用分、最近一次登录时间（优先级由高到低）后分发。</p>
                            </>
                          }
                        >
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </>}
                    name="distribute_type"
                    rules={[{ required: true, message: "请选择系统分发方式" }]}
                  >
                    <Radio.Group>
                      <Radio.Button value="order">顺序分发</Radio.Button>
                      <Radio.Button value="smart">智能分发</Radio.Button>
                      <Radio.Button value="correct">预计正确率最高</Radio.Button>
                      <Radio.Button value="fast">预计完成时间最短</Radio.Button>
                    </Radio.Group>
                    {/* <Divider type="vertical" />
                    <Tooltip
                      title={
                        <>
                          <p>分发模式决定了系统优先将任务派发给哪个用户</p>
                          <p>顺序分发：系统按照注册成功顺序从早到晚依次派发。</p>
                          <p>智能分发：系统考虑用户信用分、积分、经验、用户喜好（优先级从高到低）后分发。</p>
                          <p>预计正确率最高分发：系统考虑用户信用分、标注成功率、标注所得积分（优先级由高到低）后分发。</p>
                          <p>预计标注时间最短分发：系统考虑用户信用分、最近一次登录时间（优先级由高到低）后分发。</p>
                        </>
                      }
                    >
                      <QuestionCircleOutlined />
                    </Tooltip> */}
                  </Form.Item>
                </Col>
                <Col>
                </Col>
              </Space>
            </Row>
          </>
        )}
        {distribute === "agent" && (
          <Form.Item
            label="分发中介名"
            name="agent_username"
            rules={[{ required: true, message: "请输入分发中介名" }]}
          >
            <Select
              options={agentList.map((agent) => ({ value: agent.username, label: agent.username }))}
            />
          </Form.Item>
        )}
        {/* <Row> */}
        {/* <Space> */}
          {/* <Col> */}
          <Form.Item
            label="任务截止时间"
            name="deadline"
            rules={[{ required: true, message: "请选择任务截止时间" }]}
          >
            <DatePicker
              locale={locale.DatePicker}
              inputReadOnly
              showTime
              disabledDate={(date) => date.valueOf() < dayjs().valueOf()}
            />
          </Form.Item>
        {!batch && (
          <Form.List name="task_data">
            {(dataFields, { add: dataAdd, remove: dataRemove }) => (
              <>
                <Button
                  onClick={() => dataAdd()}
                  type="primary"
                  disabled={form.getFieldValue("template") === undefined}
                >
                  添加题目
                </Button>
                {dataFields.map((dataField, index) => (
                  <div key={index}>
                    <Divider orientation="left">{`题目${index + 1}`}</Divider>
                    <Row>
                      <Col>
                        <Form.Item
                          key={dataField.key}
                          name={[dataField.name, "description"]}
                          rules={[{ required: true, message: "请输入描述" }]}
                        >
                          <Input addonBefore="题目描述" />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Button onClick={() => dataRemove(index)} type="primary" danger>
                          删除题目
                        </Button>
                      </Col>
                    </Row>
                    {template === "TextClassification" && TextClassificationDataForm(dataField)}
                    {template === "ImagesClassification" &&
                      ImagesClassificationDataForm(dataField, handlePreview)}
                    {template === "FaceTag" && FaceTagDataForm(dataField)}
                    {template === "ImageFrame" && ImageFrameDataForm(dataField)}
                    {template === "SoundTag" && SoundTagDataForm(dataField)}
                    {template === "VideoTag" && VideoTagDataForm(dataField)}
                    {template === "TextReview" && TextReviewDataForm(dataField)}
                    {(template === "ImageReview" ||
                      template === "VideoReview" ||
                      template === "AudioReview") &&
                      FileReviewDataForm(dataField, template.substring(0, 5).toLowerCase())}
                  </div>
                ))}
              </>
            )}
          </Form.List>
        )}
        {batch && (
          <>
            <Modal
              open={infoModal}
              footer={null}
              onCancel={() => { setInfoModal(false) }}
            >
              <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
                模板规范说明
              </Typography>
              <Divider />
              <ol>
                <li>选择任务模板后，请点击左侧的“下载”按钮下载对应的模板Excel文件。</li>
                <li>请不要修改Excel文件的sheet名以及Excel文件名。</li>
                <li>请按照Excel文件中提供的样例和规范填写，请不要删除样例。</li>
                <li>填入题目时，请保持紧凑，即不要在有内容的行之间出现空行，否则空行下面的题目将不会被读取。</li>
                <li>上传时，请将所有Excel文件和其他媒体文件(图片、视频、音频等)打包成一个zip压缩包，媒体文件置于压缩包根目录下。媒体文件名只能包含字母、数字和下划线。</li>
                <li>对于自定义模板，请删除Excel文件中不需要使用的模板对应的sheet。</li>
              </ol>
            </Modal>
                <Alert
                  message={
                    <>
                      请
                      <Button type="link" onClick={() => downloadTemplate(template)}>
                        下载
                      </Button>
                      模板并按规范提交
                      <Divider type="vertical" />
                      <Tooltip title="提交规范及模板使用方法">
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setInfoModal(true)}
                          icon={<QuestionCircleOutlined />}
                        />
                      </Tooltip>
                    </>
                  }
                  type="info"
                  showIcon
                />
            <br />
                <Form.Item
                  name="batch_file"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                  rules={[{ required: true, message: "请上传压缩包" }]}
                >
                  <Upload.Dragger
                    action="/api/file"
                    headers={{ Authorization: `Bearer ${localStorage.getItem("token")}` }}
                    maxCount={1}
                    beforeUpload={() => {
                      setUploading(true);
                      return true;
                    }}
                    onChange={(info) => {
                      if (info.file.status === "done") {
                        setUploading(false);
                        message.success("上传成功");
                      } else if (info.file.status === "error") {
                        setUploading(false);
                        message.error("上传失败");
                      }
                    }}
                    onDownload={async (file) => {
                      setDownloadingZip(true);
                      axios
                        .get("/api/file", {
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                          params: { url: file.url || file.response.url },
                          responseType: "blob",
                        })
                        .then((response) => {
                          const url = URL.createObjectURL(
                            new Blob([response.data], { type: "application/zip" })
                          );
                          const link = document.createElement("a");
                          link.style.display = "none";
                          link.href = url;
                          link.download = "task.zip";
                          document.body.appendChild(link);
                          link.click();
                          URL.revokeObjectURL(link.href);
                          document.body.removeChild(link);
                        })
                        .catch((error) => message.error(`下载失败：${error.response.message}`))
                        .finally(() => setDownloadingZip(false));
                    }}
                    showUploadList={{
                      showDownloadIcon: true,
                      downloadIcon: <VerticalAlignBottomOutlined disabled={downloadingZip} />,
                      showRemoveIcon: true,
                      removeIcon: <DeleteOutlined />,
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或将压缩包文件拖拽到此处上传</p>
                  </Upload.Dragger>
                </Form.Item>
          </>
        )}
        <Button
          disabled={uploading}
          type="primary"
          loading={loading}
          onClick={() => {
            form.submit();
          }}
          size="large"
          style={{
            backgroundColor: "#3b5999",
            marginTop: "10px",
            marginBottom: "10px",
          }}
          block
        >
          提交任务
        </Button>
      </Form>
    </ConfigProvider>
  );
};

export default TaskInfoForm;
