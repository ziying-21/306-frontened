import axios from "axios";
import { useState, useEffect } from "react";
import { Spin } from "antd";

interface MyVideoProps {
  url: string;
  style?: any;
  controls?: boolean;
  poster?: string;
}

const MyVideo = (props: MyVideoProps) => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    axios
      .get("/api/file", {
        responseType: "arraybuffer",
        params: { url: props.url },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.url]);

  return (
    <Spin spinning={loading} tip="视频加载中">
      <video
        src={videoUrl}
        controls={props.controls ?? true}
        poster={props.poster}
        style={{ ...props.style, width: "100%" }}
      />
    </Spin>
  );
};

export default MyVideo;
