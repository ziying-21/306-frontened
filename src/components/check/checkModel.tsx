import { Avatar, Button, Checkbox, Col, Divider, Row, Spin, Tooltip } from "antd";
import { message } from "antd/lib";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Problem from "../demander_problem/problem";
import { request } from "@/utils/network";
import Grid from "@mui/material/Grid";
import { ProCard } from "@ant-design/pro-components";

interface CheckModelProps {
  task_id: number;
  labeler_index: number;
  is_sample: boolean;
  template: string;
  rate: number;
  is_checking: boolean;
  setIsLabelerList: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

/**
 * A checking model for checking interface
 *
 */
const CheckModel = (props: CheckModelProps) => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [passedNumber, setPassedNumber] = useState<number>(0);
  const [result, setResult] = useState<any[]>([]);
  const [checkedNumber, setCheckedNumber] = useState<number>(0);
  const [checkResult, setCheckResult] = useState<boolean[]>([]);
  const router = useRouter();
  const [problemIndex, setProblemIndex] = useState<number>(0);
  /**
   * Request for the labeled data
   *
   */
  useEffect(() => {
    request(
      `/api/task/checking?task_id=${props.task_id}&labeler_index=${props.labeler_index}`,
      "GET"
    )
      .then((response) => {
        const newProblems: any[] = response.data.label_data;
        const totalNumber = newProblems.length;
        setCheckedNumber(Math.ceil((totalNumber * props.rate) / 100));
        setResult(newProblems);
        if (props.is_sample) {
          for (let i = totalNumber - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newProblems[i], newProblems[j]] = [newProblems[j], newProblems[i]];
          }
          setResult(newProblems.slice(0, Math.ceil((totalNumber * props.rate) / 100)));
        }
        const temp: boolean[] = [];
        for (let i = 0; i < result.length; i++) {
          temp.push(false);
        }
        setCheckResult(temp);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [router, props.labeler_index, props.task_id]);

  const postCheck = async (is_passed: boolean) => {
    request("/api/checking", "POST", {
      task_id: props.task_id,
      labeler_id: props.labeler_index,
      is_passed: is_passed,
      correct_number: props.is_sample ? undefined : passedNumber,
    })
      .then(() => {
        message.success("审核结果提交成功");
        props.setIsLabelerList(true);
      })
      .catch((error) => {
        if (error.response) {
          message.error(`审核结果提交失败，${error.response.data.message}`);
        } else {
          message.error("网络失败，请稍后再试");
        }
      })
      .finally(() => {
        setRefreshing(false);
        props.setRefreshing(true);
      });
  };
  /**
   *
   * Deal with the all checking or sampling checking
   */
  return (
    <Spin spinning={refreshing}>
      <ProCard split="vertical" style={{ height: "80vh", minHeight: "500px" }}>
        <ProCard colSpan={"70%"}>
          <Divider>
            <h3>审核(下面的虚线内为题目区)</h3>
          </Divider>
          {refreshing ? (
            <p>Loading...</p>
          ) : (
            <>
              <div
                style={{
                  overflowY: "auto",
                  height: "37vh",
                  border: checkResult[problemIndex]
                    ? "dotted rgb(33, 198, 39)"
                    : "dotted rgb(221, 180, 32)",
                  padding: 10,
                }}
              >
                <Problem
                  problem={result[problemIndex]}
                  index={problemIndex}
                  total={result.length}
                  key={problemIndex}
                />
              </div>
              <Divider />
              <Grid container>
                <Grid item xs>
                  <Tooltip title={props.is_checking ? "" : "该标注方的标注已经审核过，无法再审核"}>
                    <Checkbox
                      checked={checkResult[problemIndex]}
                      onClick={() => {
                        if (!checkResult[problemIndex]) {
                          setPassedNumber((b) => b + 1);
                          const temp: boolean[] = [];
                          for (let i = 0; i < result.length; i++) {
                            temp.push(checkResult[i]);
                          }
                          temp[problemIndex] = true;
                          setCheckResult(temp);
                        }
                      }}
                      disabled={!props.is_checking}
                    >
                      合格
                    </Checkbox>
                    <Divider type="vertical" />
                    <Checkbox
                      checked={!checkResult[problemIndex]}
                      onClick={() => {
                        if (checkResult[problemIndex]) {
                          setPassedNumber((b) => b - 1);
                          const temp: boolean[] = [];
                          for (let i = 0; i < result.length; i++) {
                            temp.push(checkResult[i]);
                          }
                          temp[problemIndex] = false;
                          setCheckResult(temp);
                        }
                      }}
                      disabled={!props.is_checking}
                    >
                      不合格
                    </Checkbox>
                  </Tooltip>
                </Grid>
                <Grid>
                  <Tooltip title={problemIndex === 0 ? "已经是第一题了" : undefined}>
                    <Button
                      disabled={problemIndex === 0}
                      onClick={() => {
                        setProblemIndex((i) => i - 1);
                      }}
                    >
                      上一题
                    </Button>
                  </Tooltip>
                  <Divider type="vertical" />
                  <Tooltip
                    title={problemIndex === result.length - 1 ? "已经是最后一题了" : undefined}
                  >
                    <Button
                      disabled={problemIndex === result.length - 1}
                      onClick={() => {
                        // CarouselRef.current?.goTo(problemIndex + 1, true);
                        setProblemIndex((i) => i + 1);
                      }}
                    >
                      下一题
                    </Button>
                  </Tooltip>
                </Grid>
              </Grid>
              <Divider />
            </>
          )}
          <Grid container>
            <Grid item xs>
              <Tooltip title={props.is_checking ? "" : "该标注方的标注已经审核过，无法再审核"}>
                <Button
                  disabled={!props.is_checking}
                  onClick={() => {
                    setRefreshing(true);
                    postCheck(true);
                  }}
                  style={{
                    backgroundColor: "#3b5999",
                    color: "white",
                  }}
                >
                  合格
                </Button>
                <Divider type="vertical" />
                <Button
                  disabled={!props.is_checking}
                  style={{
                    backgroundColor: "#3b5999",
                    color: "white",
                  }}
                  onClick={() => {
                    setRefreshing(true);
                    postCheck(false);
                  }}
                >
                  不合格
                </Button>
              </Tooltip>
            </Grid>
            <Grid>
              <Button
                style={{
                  backgroundColor: "#3b5999",
                  color: "white",
                }}
                onClick={() => {
                  props.setIsLabelerList(true);
                }}
              >
                退出审核
              </Button>
            </Grid>
          </Grid>
        </ProCard>
        <ProCard colSpan={"30%"}>
          <Divider>总体数据</Divider>
          <Row>
            <Col>
              <span style={{ textAlign: "center" }}>通过题目数量: {passedNumber}</span>
            </Col>
            <Divider type="vertical" />
            <Col>
              <span style={{ textAlign: "center" }}>
                当前通过率: {(passedNumber / result.length).toFixed(2)}
              </span>
            </Col>
          </Row>
          <Divider />
          <Divider>各题情况</Divider>
          <div style={{ overflowY: "auto", height: "45vh" }}>
            <Row>
              {result.map((_, idx) => (
                <Col key={idx}>
                  <Tooltip title={result[idx].description}>
                    <Avatar
                      size={"large"}
                      onClick={() => {
                        setProblemIndex(idx);
                      }}
                      style={{
                        border: idx === problemIndex ? "solid rgb(32, 101, 221) 2px" : undefined,
                        backgroundColor: checkResult[idx]
                          ? "rgb(33, 198, 39)"
                          : "rgb(221, 180, 32)",
                        margin: 6,
                      }}
                    >
                      {idx + 1}
                    </Avatar>
                  </Tooltip>
                </Col>
              ))}
            </Row>
          </div>
          {/* </div> */}
        </ProCard>
      </ProCard>
    </Spin>
  );
};

export default CheckModel;
