import { Checkbox, Col, Divider, Image, Radio, Row } from "antd";
import CanvasImage from "../canvas_image/canvas-image";
import ImageFormatter from "../image-formatter";
import MyAudio from "../my-audio";
import MyImage from "../my-img";
import MyVideo from "../my-video";

interface ProbelmProps {
  total: number;
  problem: any;
  index: number;
}

const Problem = (props: ProbelmProps) => {
  if (props.problem.template === "TextClassification") {
    if (props.problem.data) {
      const selected: string[] = [];
      for (let i = 0; i < props.problem.options.length; i++) {
        if (props.problem.data[i]) {
          selected.push(props.problem.options[i]);
        }
      }
      return (
        <div>
          <h1 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h1>
          {props.problem.data.map((option: boolean, idx: number) => (
            <>
              <Checkbox key={idx} checked={option} disabled={true}>
                {props.problem.options[idx]}
              </Checkbox>
              <br />
              <br />
            </>
          ))}
        </div>
      );
    } else {
      return (
        <div>
          <h1 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h1>
          {props.problem.options.map((option: boolean, idx: number) => (
            <>
              <Checkbox disabled={true}>{option}</Checkbox>
              <br />
              <br />
            </>
          ))}
        </div>
      );
    }
  } else if (props.problem.template === "ImagesClassification") {
    if (props.problem.data) {
      return (
        <>
          <h3 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h3>
          <Image.PreviewGroup>
            <Row wrap={true}>
              {props.problem.options.map((option: string, index: number) => (
                <Col key={index}>
                  <Checkbox checked={props.problem.data[index]} disabled={true}>
                    <ImageFormatter>
                      <MyImage
                        url={`${option}`}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center center",
                        }}
                        alt="图片加载失败，请刷新重试"
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
    } else {
      return (
        <>
          <h3 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h3>
          <Image.PreviewGroup>
            <Row wrap={true}>
              {props.problem.options.map((option: string, index: number) => (
                <Col key={index}>
                  <Checkbox disabled={true}>
                    <ImageFormatter>
                      <MyImage
                        url={`${option}`}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center center",
                        }}
                        alt="图片加载失败，请刷新重试"
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
    }
  } else if (props.problem.template === "FaceTag") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <CanvasImage
          data={props.problem.data ? props.problem.data : []}
          src={props.problem.url}
          type="point"
        />
      </>
    );
  } else if (props.problem.template === "ImageFrame") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <CanvasImage
          data={props.problem.data ? props.problem.data : []}
          src={props.problem.url}
          type="rectangle"
        />
      </>
    );
  } else if (props.problem.template === "SoundTag") {
    if (props.problem.data) {
      return (
        <>
          <h3 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h3>
          <>
            <MyAudio url={props.problem.url} />
            <Divider />
            <Radio.Group value={props.problem.data.choiceIndex} disabled={true}>
              {props.problem.choice.map((ch: any, idx: number) => (
                <>
                  <Radio value={idx} key={idx}>
                    <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
                    <Divider type="vertical" />
                    <>
                      {ch.needInput && props.problem.data && props.problem.data.choiceIndex === idx
                        ? `标注方输入: ${props.problem.data.input}`
                        : "无输入"}
                    </>
                  </Radio>
                  <br />
                </>
              ))}
            </Radio.Group>
          </>
        </>
      );
    } else {
      return (
        <>
          <h3 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h3>
          <>
            <MyAudio url={props.problem.url} />
            <Divider />
            <Radio.Group disabled={true}>
              {props.problem.choice.map((ch: any, idx: number) => (
                <>
                  <Radio value={idx} key={idx}>
                    <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
                    <Divider type="vertical" />
                    <>无输入</>
                  </Radio>
                  <br />
                </>
              ))}
            </Radio.Group>
          </>
        </>
      );
    }
  } else if (props.problem.template === "VideoTag") {
    if (props.problem.data) {
      return (
        <>
          <h3 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h3>
          <>
            <MyVideo
              url={props.problem.url}
              style={{
                width: "300px",
                height: "200px",
              }}
            />
            <Divider />
            <Radio.Group value={props.problem.data.choiceIndex} disabled={true}>
              {props.problem.choice.map((ch: any, idx: number) => (
                <>
                  <Radio value={idx} key={idx}>
                    <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
                    <Divider type="vertical" />
                    <>
                      {ch.needInput && props.problem.data && props.problem.data.choiceIndex === idx
                        ? `标注方输入: ${props.problem.data.input}`
                        : "无输入"}
                    </>
                  </Radio>
                  <br />
                </>
              ))}
            </Radio.Group>
          </>
        </>
      );
    } else {
      return (
        <>
          <h3 style={{ fontSize: "26px" }}>
            第{props.index + 1}/{props.total}题: {props.problem.description}
          </h3>
          <>
            <MyVideo
              url={props.problem.url}
              style={{
                width: "300px",
                height: "200px",
              }}
            />
            <Divider />
            <Radio.Group disabled={true}>
              {props.problem.choice.map((ch: any, idx: number) => (
                <>
                  <Radio value={idx} key={idx}>
                    <>{`${ch.text}    ${ch.needInput ? "(该选项需要输入)" : "(该选项无需输入)"}`}</>
                    <Divider type="vertical" />
                    <>无输入</>
                  </Radio>
                  <br />
                </>
              ))}
            </Radio.Group>
          </>
        </>
      );
    }
  } else if (props.problem.template === "TextReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <p>{props.problem.content}</p>
          <Radio.Group value={props.problem.data ? props.problem.data : undefined} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problem.template === "ImageReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <ImageFormatter>
            <MyImage
              url={props.problem.url}
              style={{
                objectFit: "contain",
                objectPosition: "center center",
              }}
              alt="图片加载失败"
              height="100%"
              width="100%"
            />
          </ImageFormatter>
          <Radio.Group value={props.problem.data ? props.problem.data : undefined} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problem.template === "VideoReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <MyVideo
            url={props.problem.url}
            style={{
              width: "300px",
              height: "200px",
            }}
          />
          <Divider />
          <Radio.Group value={props.problem.data ? props.problem.data : undefined} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problem.template === "AudioReview") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <>
          <MyAudio url={props.problem.url} />
          <Divider />
          <Radio.Group value={props.problem.data ? props.problem.data : undefined} disabled>
            <Radio value={true}>合格</Radio>
            <Radio value={false}>不合格</Radio>
          </Radio.Group>
        </>
      </>
    );
  } else if (props.problem.template === "TextTriple") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        <p>{props.problem.text}</p>
        <p>
          <b>主体：</b>
          {props.problem.data ? props.problem.data.subject : "（未标注）"}
        </p>
        <p>
          <b>对象：</b>
          {props.problem.data ? props.problem.data.object : "（未标注）"}
        </p>
        <p>
          <b>关系：</b>
          {props.problem.data ? props.problem.data.relation : "（未标注）"}
        </p>
      </>
    );
  } else if (props.problem.template === "SentenceSort") {
    return (
      <>
        <h3 style={{ fontSize: "26px" }}>
          第{props.index + 1}/{props.total}题: {props.problem.description}
        </h3>
        {props.problem.data.map((problem: any, idx: number) => (
          <p key={idx}><b>第{idx}句：</b>{problem.content}</p>
        ))}
      </>
    )
  } else {
    return <>Error Task Template</>;
  }
};

export default Problem;
