import { Spin } from "antd/lib";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface DottedProps {
  problemList: any[];
  index: number;
  setProblemList: Dispatch<SetStateAction<any[]>>;
}

const Dotted = (props: DottedProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const canvasRef = useRef<any>(null);
  const [flag, setFlag] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const img = new Image();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    img.onload = () => {
      canvas.width = 400;
      canvas.height = (400 * img.height) / img.width;
      for (const marker of props.problemList[props.index].data
        ? props.problemList[props.index].data
        : []) {
        ctx.beginPath();
        ctx.arc(
          marker.x * canvas.width,
          marker.y * canvas.height,
          canvas.width / 200,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "red";
        ctx.fill();
      }
      setLoading(false);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const marker of props.problemList[props.index].data
      ? props.problemList[props.index].data
      : []) {
      ctx.beginPath();
      ctx.arc(
        marker.x * canvas.width,
        marker.y * canvas.height,
        canvas.width / 200,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "red";
      ctx.fill();
    }
    console.log(props.problemList[props.index].data);
  }, [flag, props.problemList]);

  const handleMouseUp = (event: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const offsetX = event.offsetX;
    const offsetY = event.offsetY;
    const newProblems = [...props.problemList];
    newProblems[props.index].data = [
      ...(newProblems[props.index].data ? newProblems[props.index].data : []),
      { x: offsetX / canvas.width, y: offsetY / canvas.height },
    ];
    props.setProblemList(newProblems);
    setFlag((i) => !i);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <Spin spinning={loading} tip={"图片加载中"}>
        <img
          src={imageUrl}
          style={{ position: "relative", top: "0", left: "0", zIndex: "1", width: 400 }}
        />
        <canvas
          ref={canvasRef}
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

export default Dotted;
