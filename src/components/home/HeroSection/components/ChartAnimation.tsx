"use client";

import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

const chartData = [
  { x: 0, y: 50, value: "$5,120" },
  { x: 20, y: 30, value: "$3,490" },
  { x: 40, y: 70, value: "$5,800" },
  { x: 60, y: 40, value: "$4,572" },
  { x: 80, y: 90, value: "$7,819" },
  { x: 100, y: 60, value: "$5,745" },
];

interface ChartAnimationProps {
  lineColor?: string;
  pointColor?: string;
}

const ChartAnimation: React.FC<ChartAnimationProps> = ({
  lineColor = "#3b82f6", // blue-500 in hex - same as FeatureCard's blue icon
  pointColor = "#3b82f6",
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  const [lineLength, setLineLength] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate actual positions based on percentages and container dimensions
  const calculatePosition = (point: (typeof chartData)[0]) => {
    // Add padding to ensure edge points are fully visible (circle radius is max 6px)
    const padding = 10; // px
    const usableWidth = dimensions.width - padding * 2;

    return {
      // Scale x from 0-100 to padding-(width-padding)
      x: padding + (point.x / 100) * usableWidth,
      y: (point.y / 100) * dimensions.height,
    };
  };

  // Calculate the path for the line
  const linePath = (() => {
    const points = chartData.map((point) => {
      const pos = calculatePosition(point);
      return { x: pos.x, y: dimensions.height - pos.y };
    });

    // Create a smooth path with bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      // Control points for the curve
      const controlX = (current.x + next.x) / 2;

      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
  })();

  // Animation for the value display
  useEffect(() => {
    // Start the animation - initially animate the line
    const lineAnimation = setTimeout(() => {
      setLineLength(100);
    }, 500);

    // Set up interval to cycle through points
    intervalRef.current = setInterval(() => {
      setActivePointIndex((prevIndex) => (prevIndex + 1) % chartData.length);
    }, 3000);

    return () => {
      clearTimeout(lineAnimation);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      {/* SVG for chart line and points */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
          {/* Animated line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: lineLength / 100 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Chart points */}
          {chartData.map((point, index) => {
            const pos = calculatePosition(point);
            return (
              <g key={index}>
                <motion.circle
                  cx={pos.x}
                  cy={dimensions.height - pos.y}
                  r={index === activePointIndex ? 6 : 4}
                  fill={index === activePointIndex ? pointColor : "white"}
                  stroke={pointColor}
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: lineLength === 100 ? 1 : 0,
                    scale: lineLength === 100 ? (index === activePointIndex ? 1.2 : 1) : 0,
                  }}
                  transition={{
                    delay: (index / chartData.length) * 1.5,
                    duration: 0.3,
                  }}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Value display */}
      {dimensions.width > 0 && dimensions.height > 0 && activePointIndex >= 0 && (
        <motion.div
          className="absolute rounded-md bg-blue-500 px-2 py-1 text-sm font-medium text-gray-100"
          style={{
            left: calculatePosition(chartData[activePointIndex]).x,
            top: dimensions.height - calculatePosition(chartData[activePointIndex]).y - 40,
            transform: "translate(-50%, -50%)",
            opacity: lineLength === 100 ? 1 : 0,
          }}
          animate={{
            left: calculatePosition(chartData[activePointIndex]).x,
            top: dimensions.height - calculatePosition(chartData[activePointIndex]).y - 40,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {chartData[activePointIndex].value}
        </motion.div>
      )}
    </div>
  );
};

export default ChartAnimation;
