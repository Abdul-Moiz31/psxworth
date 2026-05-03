import React, { HTMLAttributes } from "react";

interface SpacerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  axis?: "horizontal" | "vertical";
  style?: React.CSSProperties;
}

const Spacer: React.FC<SpacerProps> = ({
  size = 8, // Provide a default size
  axis = "vertical", // Provide a default axis
  style = {},
  ...delegated
}) => {
  const width = axis === "vertical" ? 1 : size;
  const height = axis === "horizontal" ? 1 : size;

  return (
    <span
      style={{
        display: "block",
        width,
        minWidth: width,
        height,
        minHeight: height,
        ...style,
      }}
      {...delegated}
    />
  );
};

export default Spacer;
