import { Spin } from "antd";
import axios from "axios";
import { useRef, useEffect, useState, Dispatch, SetStateAction } from "react";

interface DottedProps {
  problemList: any[];
  index: number;
  setProblemList: Dispatch<SetStateAction<any[]>>;
}

const Rectangle = (props: DottedProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const canvasRef = useRef<any>(null);
  const [rectangles, setRectangles] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const img = new Image();

  useEffect(() => {
    setLoading(true);
  }, [props.index]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    img.onload = () => {
      canvas.width = 400;
      canvas.height = (400 * img.height) / img.width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      (props.problemList[props.index].data ? props.problemList[props.index].data : []).forEach(
        (rect: any) => {
          ctx.lineWidth = 2;
          ctx.strokeRect(
            rect.x * canvas.width,
            rect.y * canvas.height,
            rect.width * canvas.width,
            rect.height * canvas.height
          );
        }
      );
    };
    axios
      .get("/api/file", {
        responseType: "arraybuffer", // 将响应数据解析为 ArrayBuffer 类型
        params: { url: props.problemList[props.index].url },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        img.src = url;
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.index]);

  // 绘制所有的矩形
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // 绘制所有的矩形
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ff0000";
    (props.problemList[props.index].data ? props.problemList[props.index].data : []).forEach(
      (rect: any) => {
        // rectangles.forEach((rect: any) => {
        ctx.lineWidth = 2;
        ctx.strokeRect(
          rect.x * canvas.width,
          rect.y * canvas.height,
          rect.width * canvas.width,
          rect.height * canvas.height
        );
      }
    );
  }, [rectangles, props.problemList]);

  function handleMouseDown(event: any) {
    const { offsetX, offsetY } = event.nativeEvent;
    setIsDrawing(true);
    setStartX(offsetX);
    setStartY(offsetY);
  }

  function handleMouseMove(event: any) {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = event.nativeEvent;
    const width = offsetX - startX;
    const height = offsetY - startY;
    // 绘制矩形
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, width, height);
  }

  function handleMouseUp(event: any) {
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = event.nativeEvent;
    const width = offsetX - startX;
    const height = offsetY - startY;
    console.log({ x: startX, y: startY, width, height });
    setIsDrawing(false);
    // 添加矩形到矩形数组
    const newProblems = [...props.problemList];
    newProblems[props.index].data = [
      ...(newProblems[props.index].data ? newProblems[props.index].data : []),
      {
        x: startX / canvas.width,
        y: startY / canvas.height,
        width: width / canvas.width,
        height: height / canvas.height,
      },
    ];
    props.setProblemList(newProblems);
    setRectangles((i) => !i);
  }

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <Spin spinning={loading} tip="图片加载中">
        <img
          src={imageUrl}
          style={{ position: "relative", top: "0", left: "0", zIndex: "1", width: 400 }}
          onLoad={() => {
            setLoading(false);
          }}
          alt="图片加载失败"
        />
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "2",
            backgroundColor: "transparent",
            width: 400,
            display: loading ? "none" : "block",
          }}
        />
      </Spin>
    </div>
  );
};

export default Rectangle;
