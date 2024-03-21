interface ImageFormatterProps {
  children: any;
}

const ImageFormatter = (props: ImageFormatterProps) => {
  return (
    <div
      style={{
        width: "102px",
        height: "102px",
        padding: "9px",
        border: "solid #00000015",
        borderRadius: "10px",
      }}
      className="imageFormatter"
    >
      {props.children}
    </div>
  );
};

export default ImageFormatter;
