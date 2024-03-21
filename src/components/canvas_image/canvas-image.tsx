import { translateUrl } from "@/utils/valid";
import { useRef, useEffect, useState } from "react";
import { Image, Spin } from "antd";
import ImageFormatter from "../image-formatter";

interface CanvasImageProps {
  data: any[];
  src: string;
  type: "point" | "rectangle";
}

const colors: string[] = ["#FF0000", "#22ff00", "#d4ff00", "#00ccff"];

const CanvasImage = (props: CanvasImageProps) => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const canvasRef = useRef<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = translateUrl(props.src);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (let i = 0; i < props.data.length; i++) {
        if (props.type === "rectangle") {
          ctx.strokeStyle = colors[i % 4];
          ctx.lineWidth = 2;
          ctx.strokeRect(
            props.data[i].x * canvas.width,
            props.data[i].y * canvas.height,
            props.data[i].width * canvas.width,
            props.data[i].height * canvas.height
          );
        } else if (props.type ==="point"){
          ctx.beginPath();
          ctx.arc(
            props.data[i].x * canvas.width,
            props.data[i].y * canvas.height,
            canvas.width / 200,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = "red";
          ctx.fill();
        }
      }
      const dataURL = canvas.toDataURL("image/png");
      setImageUrl(dataURL);
      setRefreshing(false);
    };
  }, [refreshing]);
  return (
    <>
      <canvas width={90} ref={canvasRef} style={{ display: "none" }} />
      {refreshing ? (
        <Spin tip="图片加载中，请稍候..." />
      ) : (
        <ImageFormatter>
          <Image
            src={imageUrl}
            width={"100%"}
            height={"100%"}
            style={{
              objectFit: "contain",
              objectPosition: "center center",
            }}
            alt="图片加载失败"
            loading="lazy"
          />
        </ImageFormatter>
      )}
    </>
  );
};

export default CanvasImage;
