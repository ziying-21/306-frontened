import { ColumnsType } from "antd/es/table";
import { Button, Col, Divider, Form, Modal, Row, Table, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import MyImage from "@/components/my-img";
import ImageFormatter from "@/components/image-formatter";
import { request } from "@/utils/network";
import Typography from "@mui/material/Typography";
import { Grid, TextField } from "@mui/material";
import { mapRole2En } from "@/const/interface";
import AdminQuery from "@/components/admin-query";

interface Report {
  report_id: number;
  reporter_id: number;
  task_id: number;
  user_id: number;
  reporter_role: string;
  reported_role: string;
  description: string;
  image_description: string[];
}

const AdministratorReport = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportList, setReportList] = useState<Report[]>([]);
  const [dealReportModalOpen, setDealReportModalOpen] = useState<boolean>(false);
  const [pass, setPass] = useState<boolean>(false);
  const [reportId, setReportId] = useState<number>(-1);
  const [detail, setDetail] = useState<Report>({
    report_id: -1,
    reporter_id: -1,
    task_id: -1,
    user_id: -1,
    description: "",
    image_description: [],
    reporter_role: "demander",
    reported_role: "labeler",
  });
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [queryModalOpen, setQueryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    request("/api/administrator/report", "GET")
      .then((reponse) => {
        setReportList(reponse.data.data);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`获取举报列表失败，${error.response.data.message}`);
        } else {
          message.error("获取举报列表失败，网络错误");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refreshing]);

  const deal_report = async (
    report_id: number,
    pass: boolean,
    credits: number,
    description: string
  ) => {
    request("/api/administrator/report", "POST", {
      report_id: report_id,
      pass: pass,
      credits: credits,
      description: description,
    })
      .then(() => {
        message.success("处理成功");
      })
      .catch((error) => {
        if (error.response) {
          message.error(`举报处理失败，${error.response.data.message}`);
        } else {
          message.error("举报处理失败，网络错误");
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(true);
      });
  };
  const ReportTableColumns: ColumnsType<any> = [
    {
      title: "举报ID",
      dataIndex: "report_id",
      key: "report_id",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.report_id - b.report_id,
    },
    {
      title: "举报者ID",
      dataIndex: "reporter_id",
      key: "reporter_id",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.reporter_id - b.reporter_id,
    },
    {
      title: "被举报者ID",
      dataIndex: "user_id",
      key: "user_id",
      align: "center",
      width: "20%",
      sorter: (a, b) => a.user_id - b.user_id,
    },
    {
      title: "审核与查看",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                setPass(true);
                setDealReportModalOpen(true);
                setReportId(record.report_id);
              }}
            >
              通过
            </Button>
            <Button
              type="link"
              onClick={() => {
                setPass(false);
                setDealReportModalOpen(true);
                setReportId(record.report_id);
              }}
            >
              驳回
            </Button>
            <Tooltip title="查看标注，防止一面之辞">
              <Button
                type="link"
                onClick={() => {
                  setQueryModalOpen(true);
                  setDetail(record);
                }}
              >
                查看标注
              </Button>
            </Tooltip>
            <Tooltip title="查看举报详情">
              <Button
                type="link"
                onClick={() => {
                  setDetailModalOpen(true);
                  setDetail(record);
                }}
              >
                查看举报
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];
  return (
    <>
      <Modal
        open={dealReportModalOpen}
        onCancel={() => {
          setDealReportModalOpen(false);
        }}
        footer={null}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          {pass ? "通过举报" : "驳回举报"}
        </Typography>
        <Divider></Divider>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            setLoading(true);
            deal_report(reportId, pass, values.credits, values.description);
            setDealReportModalOpen(false);
          }}
          autoComplete="off"
        >
          <Grid item xs={24} sm={12}>
            <p>管理员可以对{pass ? "被举报者" : "恶意举报的举报者"}扣除信用分</p>
            <Form.Item
              name="credits"
              rules={[
                { required: true, message: "不能为空" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value < 0) {
                      return Promise.reject(new Error("扣除的信用分不能为负数"));
                    }
                    if (value > 100) {
                      return Promise.reject(new Error("扣除的信用分不能超过100"));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TextField
                name="credits"
                fullWidth
                id="credits"
                label="扣除的信用分"
                autoFocus
                type="number"
              />
            </Form.Item>
            <p>管理员需要对{pass ? "被举报者" : "被驳回的举报"}进行说明</p>
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
          </Grid>
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
            确认
          </Button>
        </Form>
      </Modal>
      <Modal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
        }}
        footer={null}
        title="举报详情"
      >
        <br />
        <b>
          举报ID: {detail.report_id} <Divider type="vertical" /> 举报者ID: {detail.reporter_id}
          {" (" + mapRole2En[detail.reporter_role] + ")"}
          <Divider type="vertical" /> 被举报者ID: {detail.user_id}
          {" (" + mapRole2En[detail.reported_role] + ")"}
        </b>
        <Divider />
        <p>举报者描述: {detail.description}</p>
        <p>图片证据:</p>
        <Row>
          {detail.image_description.map((url, idx) => (
            <Col key={idx}>
              <ImageFormatter key={idx}>
                <MyImage
                  url={`${url}`}
                  style={{
                    objectFit: "contain",
                    objectPosition: "center center",
                  }}
                  alt="图片加载失败，请刷新后重试..."
                  height="100%"
                  width="100%"
                />
              </ImageFormatter>
            </Col>
          ))}
        </Row>
      </Modal>
      <Modal
        open={queryModalOpen}
        onCancel={() => {
          setQueryModalOpen(false);
        }}
        footer={null}
        destroyOnClose
        maskClosable={false}
      >
        <Typography component="h1" variant="h5" style={{ textAlign: "center" }}>
          标注详情
        </Typography>
        <AdminQuery
          task_id={detail.task_id}
          labeler_id={detail.reported_role === "labeler" ? detail.user_id : detail.reporter_id}
        />
      </Modal>
      <Table
        columns={ReportTableColumns}
        dataSource={reportList}
        loading={refreshing || loading}
        pagination={{ pageSize: 6 }}
      />
    </>
  );
};

export default AdministratorReport;
