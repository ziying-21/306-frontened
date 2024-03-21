import React, { useRef, useEffect } from "react";
import { Button, Card, message } from "antd";

const CameraVideo: React.FC<{
  fileName: string;
  onFinish: (faceImage: File) => void;
}> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const constraints: MediaStreamConstraints = { audio: false, video: true };
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (video) {
            video.srcObject = stream;
            video.play();
          }
        })
        .catch((err) => {
          console.error(err);
          message.error("获取摄像头失败");
        });
    } else {
      message.warning("为保证安全，请使用https建立安全连接");
    }

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = "";
      }
    };
  });

  const handleOk = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 1080;
      canvas.height = 810;
    }
    const context = canvas?.getContext("2d");
    if (videoRef.current && context) {
      if (canvas) context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      else context.drawImage(videoRef.current, 0, 0);
      canvas?.toBlob((blob) => {
        const file = new File([blob as Blob], props.fileName, { type: "image/png" });
        props.onFinish(file);
      });
    }
  };

  return (
    <>
      <Card>
        <video ref={videoRef} style={{ width: "100%", borderRadius: 20 }} />
      </Card>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <b>注：</b>如果您的人脸被绑定到多个账号，您在使用人脸登录时将默认登录到最早注册的账号
      <Button
        onClick={handleOk}
        size="large"
        block
        style={{
          backgroundColor: "#3b5999",
          color: "white",
          marginTop: 5,
        }}
      >
        捕获
      </Button>
    </>
  );
};

export default CameraVideo;
