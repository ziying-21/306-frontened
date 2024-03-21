import axios from "axios";
import { useState, useEffect } from "react";
import { Spin } from "antd";

interface MyAudioProps {
  url: string;
  style?: any;
  controls?: boolean;
}

const MyAudio = (props: MyAudioProps) => {
  const [audioUrl, setAudioUrl] = useState<string>("");
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
        const blob = new Blob([response.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.url]);

  return (
    <Spin spinning={loading} tip="音频加载中">
      <audio src={audioUrl} controls={props.controls ?? true} style={{ width: "100%" }} />
    </Spin>
  );
};

export default MyAudio;
