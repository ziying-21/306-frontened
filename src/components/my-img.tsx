import axios from "axios";
import { useState, useEffect } from "react";
import { Image, ImageProps, Spin } from "antd";
interface MyImageProps extends Omit<ImageProps, "src"> {
  url: string;
  onImageLoad?: (size: { width: number; height: number }) => void;
}

const MyImage = (props: MyImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(true);
  useEffect(() => {
    axios
      .get("/api/file", {
        responseType: "arraybuffer", // 将响应数据解析为 ArrayBuffer 类型
        params: { url: props.url },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [props.url]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (props.onImageLoad) {
      const imgElement = e.target as HTMLImageElement; // Cast event target to HTMLImageElement
      const { offsetWidth, offsetHeight } = imgElement;
      props.onImageLoad({ width: offsetWidth, height: offsetHeight });
      console.log("image loaded", "W: ", offsetWidth, "H: ", offsetHeight);
    }
  };

  return (
    <>
      {refreshing ? (
        <Spin spinning={refreshing} tip="图片加载中..." />
      ) : (
        <Image src={imageUrl} {...props} alt={props.alt} onLoad={handleImageLoad} />
      )}
    </>
  );
};

export default MyImage;
