import { ApexOptions } from "apexcharts";

export const getChartOptions = (dataPointsCount = 0, yAxisLabel = "Return %"): ApexOptions => {
  const hasDenseCategories = dataPointsCount > 20;

  return {
    chart: {
      background: "#0f172a",
      parentHeightOffset: 0,
      type: "bar",
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
        allowMouseWheelZoom: false,
      },
      toolbar: {
        show: true,
        offsetX: 3,
        offsetY: 0,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomout: true,
          zoomin: true,
          pan: true,
          reset: true,
        },
        autoSelected: hasDenseCategories ? "pan" : "zoom",
        export: {
          // Increase PNG export scale for sharper raster exports
          //TODO: This increase the svg width and height too much and we need to fix that.
          scale: typeof window !== "undefined" ? Math.max(3, Math.ceil(window.devicePixelRatio)) : 3,
          width: 1000,
          csv: {
            filename: "performance-bar-chart",
            headerCategory: "Stock",
            headerValue: "Return (%)",
            columnDelimiter: ",",
          },
          svg: { filename: "performance-bar-chart" },
          png: { filename: "performance-bar-chart" },
        },
      },
    },
    plotOptions: {
      bar: {
        columnWidth: hasDenseCategories ? "70%" : "88%",
        dataLabels: {
          maxItems: hasDenseCategories ? 20 : 100,
          hideOverflowingLabels: true,
        },
        colors: {
          ranges: [
            {
              from: -Infinity,
              to: 0,
              color: "#ff4560",
            },
            {
              from: 0,
              to: Infinity,
              color: "#00e396",
            },
          ],
        },
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (value) => `${value.toFixed(2)}%`,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => Number(value).toFixed(1),
      style: {
        colors: ["#fff"],
        fontSize: "12px",
      },
    },
    grid: {
      borderColor: "#40475D",
    },
    xaxis: {
      title: {
        text: "Stock",
        style: { color: "#fff" },
      },
      labels: {
        rotate: hasDenseCategories ? -45 : 0,
        rotateAlways: hasDenseCategories,
        hideOverlappingLabels: true,
        trim: hasDenseCategories,
        maxHeight: hasDenseCategories ? 80 : 120,
        style: {
          colors: "#fff",
        },
      },
    },
    yaxis: {
      title: {
        text: yAxisLabel,
        style: { color: "#fff" },
      },
      labels: {
        style: {
          colors: "#fff",
        },
        formatter: (value) => `${value.toFixed(1)}%`,
      },
    },

    noData: {
      text: "No data available. Please add stocks to your portfolio.",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#fff",
        fontSize: "16px",
      },
    },
  };
};
