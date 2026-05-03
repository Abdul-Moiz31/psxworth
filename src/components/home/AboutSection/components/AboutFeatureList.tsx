"use client";

import { MotionValue } from "motion/react";
import { AboutFeatureItem } from "./AboutFeatureItem";

export const AboutFeatureList = ({
  item1Progress,
  item2Progress,
  item3Progress,
}: {
  item1Progress: MotionValue<string>;
  item2Progress: MotionValue<string>;
  item3Progress: MotionValue<string>;
}) => {
  const features = [
    {
      number: "01",
      title: "Seamless User Experience",
      description:
        "We prioritize your experience. Our web app is designed for speed and reliability, featuring smooth, engaging animations that make tracking your investments a pleasure.",
      color: "cyan",
      progress: item1Progress,
    },
    {
      number: "02",
      title: "Transparency",
      description:
        "We believe in complete transparency when tracking investments, showing the real value of your money.",
      color: "blue",
      progress: item2Progress,
    },
    {
      number: "03",
      title: "Simplicity",
      description:
        "Complex financial data presented in a simple, intuitive interface that anyone can understand and use.",
      color: "purple",
      progress: item3Progress,
    },
  ];

  return (
    <div className="">
      {features.map((item) => (
        <AboutFeatureItem
          key={item.number}
          number={item.number}
          title={item.title}
          description={item.description}
          progress={item.progress}
        />
      ))}
    </div>
  );
};
