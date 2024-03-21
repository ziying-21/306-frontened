import { Checkbox, Row, Image, Col, Divider, Radio, Input } from "antd";
import ImageFormatter from "../image-formatter";
import MyImage from "../my-img";
import MyAudio from "../my-audio";
import MyVideo from "../my-video";
import { Dispatch, SetStateAction } from "react";
import Dotted from "@/components/demander_problem/dotted";
import Rectangle from "@/components/demander_problem/rectangle";
import { TextField } from "@mui/material";
import Sort from "./sort";


interface LabelerProblemProps {
  problemList: any[];
  total: number;
  index: number;
  setProblemList: Dispatch<SetStateAction<any[]>>;
}

const LabelerProblem = (props: LabelerProblemProps) => {
  if (props.problemList[props.index].template === "TextClassification") {
    return (
      <div>
        <h1 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h1>
        {props.problemList[props.index].options.map((option: boolean, idx: number) => (
          <>
            <Checkbox
              key={idx}
              checked={
                props.problemList[props.index].data && props.problemList[props.index].data[idx]
              }
              onChange={(e) => {
                const newProblems: any[] = [...props.problemList];
                if (newProblems[props.index].data) {
                  newProblems[props.index].data[idx] = e.target.checked;
                } else {
                  newProblems[props.index].data = [];
                  for (let i = 0; i < props.problemList[props.index].options.length; i++) {
                    if (i == idx) {
                      newProblems[props.index].data.push(true);
                    } else {
                      newProblems[props.index].data.push(false);
                    }
                  }
                }
                props.setProblemList(newProblems);
              }}
            >
              {option}
            </Checkbox>
            <br />
            <br />
          </>
        ))}
      </div>
    );
  } else if (props.problemList[props.index].template === "ImagesClassification") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <Image.PreviewGroup>
          <Row wrap={true}>
            {props.problemList[props.index].options.map((option: string, idx: number) => (
              <Col key={idx}>
                <Checkbox
                  checked={
                    props.problemList[props.index].data && props.problemList[props.index].data[idx]
                  }
                  onChange={(e) => {
                    const newProblems: any[] = [...props.problemList];
                    if (newProblems[props.index].data) {
                      newProblems[props.index].data[idx] = e.target.checked;
                    } else {
                      newProblems[props.index].data = [];
                      for (let i = 0; i < props.problemList[props.index].options.length; i++) {
                        if (i == idx) {
                          newProblems[props.index].data.push(true);
                        } else {
                          newProblems[props.index].data.push(false);
                        }
                      }
                    }
                    props.setProblemList(newProblems);
                  }}
                >
                  <ImageFormatter>
                    <MyImage
                      url={`${option}`}
                      style={{
                        objectFit: "contain",
                        objectPosition: "center center",
                      }}
                      alt="图片加载失败"
                      height="100%"
                      width="100%"
                    />
                  </ImageFormatter>
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Image.PreviewGroup>
      </>
    );
  } else if (props.problemList[props.index].template === "FaceTag") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <Dotted
          problemList={props.problemList}
          index={props.index}
          setProblemList={props.setProblemList}
        />
      </>
    );
  } else if (props.problemList[props.index].template === "ImageFrame") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <Rectangle
          problemList={props.problemList}
          index={props.index}
          setProblemList={props.setProblemList}
        />
      </>
    );
  } else if (props.problemList[props.index].template === "SoundTag") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <>
          <MyAudio url={props.problemList[props.index].url} />
          <Divider />
          <Radio.Group
            value={
              props.problemList[props.index].data
                ? props.problemList[props.index].data.choiceIndex
                : undefined
            }
            onChange={(e) => {
              const newProblems: any[] = [...props.problemList];
              if (newProblems[props.index].data) {
                newProblems[props.index].data.choiceIndex = e.target.value;
              } else {
                newProblems[props.index].data = {
                  choiceIndex: e.target.value,
                  input: "",
                };
              }
              props.setProblemList(newProblems);
              console.log(newProblems);
            }}
          >
            {props.problemList[props.index].choice.map((ch: any, idx: number) => (
              <div style={{ margin: 8 }} key={idx}>
                <Radio value={idx} key={idx}>
                  <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
                  <Divider type="vertical" />
                </Radio>
                <br />
              </div>
            ))}
          </Radio.Group>
          <br />
          <>
            如果需要的话请在下面的框中填写你的输入
            <br />
            <br />
            <Input
              disabled={
                !props.problemList[props.index].data ||
                !Number.isInteger(props.problemList[props.index].data.choiceIndex) ||
                !props.problemList[props.index].choice[
                  props.problemList[props.index].data.choiceIndex
                ].needInput
              }
              onChange={(e) => {
                const newProblems: any[] = [...props.problemList];
                newProblems[props.index].data.input = e.target.value;
                props.setProblemList(newProblems);
                console.log(newProblems);
              }}
              value={
                props.problemList[props.index].data ? props.problemList[props.index].data.input : ""
              }
            />
          </>
        </>
      </>
    );
  } else if (props.problemList[props.index].template === "VideoTag") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <>
          <MyVideo
            url={props.problemList[props.index].url}
            style={{
              width: "300px",
              height: "200px",
            }}
          />
          <Divider />
          <Radio.Group
            value={
              props.problemList[props.index].data
                ? props.problemList[props.index].data.choiceIndex
                : undefined
            }
            onChange={(e) => {
              const newProblems: any[] = [...props.problemList];
              if (newProblems[props.index].data) {
                newProblems[props.index].data.choiceIndex = e.target.value;
              } else {
                newProblems[props.index].data = {
                  choiceIndex: e.target.value,
                  input: "",
                };
              }
              props.setProblemList(newProblems);
              console.log(newProblems);
            }}
          >
            {props.problemList[props.index].choice.map((ch: any, idx: number) => (
              <div style={{ margin: 8 }} key={idx}>
                <Radio value={idx} key={idx}>
                  <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
                  <Divider type="vertical" />
                </Radio>
                <br />
              </div>
            ))}
          </Radio.Group>
          <br />
          <>
            如果需要的话请在下面的框中填写你的输入
            <br />
            <br />
            <Input
              disabled={
                !props.problemList[props.index].data ||
                !Number.isInteger(props.problemList[props.index].data.choiceIndex) ||
                !props.problemList[props.index].choice[
                  props.problemList[props.index].data.choiceIndex
                ].needInput
              }
              onChange={(e) => {
                const newProblems: any[] = [...props.problemList];
                newProblems[props.index].data.input = e.target.value;
                props.setProblemList(newProblems);
                console.log(newProblems);
              }}
              value={
                props.problemList[props.index].data ? props.problemList[props.index].data.input : ""
              }
            />
          </>
        </>
      </>
    );
  } else if (props.problemList[props.index].template === "TextReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <>
          <p>{props.problemList[props.index].content}</p>
          <Radio.Group
            value={props.problemList[props.index].data}
            onChange={(e) => {
              const newProblems: any[] = [...props.problemList];
              newProblems[props.index].data = e.target.value;
              props.setProblemList(newProblems);
              console.log(newProblems);
            }}
          >
            <Radio value={true}>合格</Radio>
            <Divider type="vertical" />
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problemList[props.index].template === "ImageReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <>
          <ImageFormatter>
            <MyImage
              url={props.problemList[props.index].url}
              style={{
                objectFit: "contain",
                objectPosition: "center center",
              }}
              alt="图片加载失败"
              height="100%"
              width="100%"
            />
          </ImageFormatter>
          <Radio.Group
            value={props.problemList[props.index].data}
            onChange={(e) => {
              const newProblems: any[] = [...props.problemList];
              newProblems[props.index].data = e.target.value;
              props.setProblemList(newProblems);
              console.log(newProblems);
            }}
          >
            <Radio value={true}>合格</Radio>
            <Divider type="vertical" />
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problemList[props.index].template === "VideoReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <>
          <MyVideo
            url={props.problemList[props.index].url}
            style={{
              width: "300px",
              height: "200px",
            }}
          />
          <Divider />
          <Radio.Group
            value={props.problemList[props.index].data}
            onChange={(e) => {
              const newProblems: any[] = [...props.problemList];
              newProblems[props.index].data = e.target.value;
              props.setProblemList(newProblems);
              console.log(newProblems);
            }}
          >
            <Radio value={true}>合格</Radio>
            <Divider type="vertical" />
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problemList[props.index].template === "AudioReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <>
          <MyAudio url={props.problemList[props.index].url} />
          <Divider />
          <Radio.Group
            value={props.problemList[props.index].data}
            onChange={(e) => {
              const newProblems: any[] = [...props.problemList];
              newProblems[props.index].data = e.target.value;
              props.setProblemList(newProblems);
              console.log(newProblems);
            }}
          >
            <Radio value={true}>合格</Radio>
            <Divider type="vertical" />
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problemList[props.index].template === "TextTriple") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <p style={{ fontSize: "26px" }}><b>文本: </b>{props.problemList[props.index].text}</p>
        <TextField
          fullWidth
          label="主体"
          onChange={(e) => {
            const newProblems: any[] = [...props.problemList];
            if (!newProblems[props.index].data) {
              newProblems[props.index].data = {};
            }
            newProblems[props.index].data.subject = e.target.value;
            props.setProblemList(newProblems);
          }}
          value={props.problemList[props.index].data ? props.problemList[props.index].data.subject : ""}
        />
        <br />
        <br />
        <TextField
          fullWidth
          label="对象"
          onChange={(e) => {
            const newProblems: any[] = [...props.problemList];
            if (!newProblems[props.index].data) {
              newProblems[props.index].data = {};
            }
            newProblems[props.index].data.object = e.target.value;
            props.setProblemList(newProblems);
          }}
          value={props.problemList[props.index].data ? props.problemList[props.index].data.object : ""}
        />
        <br />
        <br />
        <TextField
          label="关系"
          fullWidth
          multiline
          onChange={(e) => {
            const newProblems: any[] = [...props.problemList];
            if (!newProblems[props.index].data) {
              newProblems[props.index].data = {};
            }
            newProblems[props.index].data.relation = e.target.value;
            props.setProblemList(newProblems);
          }}
          value={props.problemList[props.index].data ? props.problemList[props.index].data.relation : ""}
        />
      </>
    );
  } else if (props.problemList[props.index].template === "SentenceSort") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problemList[props.index].description}
        </h3>
        <Sort problemList={props.problemList} index={props.index} setProblemList={props.setProblemList}/>
      </>
    )
  } else {
    return <>Error Task Template</>;
  }
};

export default LabelerProblem;
