"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TooltipItem,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

type TrafficOverviewChartProps = {
  labels: string[];
  sessions: number[];
  articleViews: number[];
};

export function TrafficOverviewChart({
  labels,
  sessions,
  articleViews,
}: TrafficOverviewChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "Phien truy cap",
        data: sessions,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.15)",
        pointBackgroundColor: "#0ea5e9",
        pointRadius: 3,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: true,
        datalabels: {
          display: false,
        },
      },
      {
        label: "Luot xem bai viet",
        data: articleViews,
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        pointBackgroundColor: "#f97316",
        pointRadius: 3,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: false,
        datalabels: {
          display: false,
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label(context: TooltipItem<"line">) {
            const datasetLabel = context.dataset.label ?? "";
            const value = context.parsed.y ?? 0;
            return `${datasetLabel}: ${value.toLocaleString("vi-VN")}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback(value: string | number) {
            const numeric = typeof value === "number" ? value : Number(value);
            return Number.isFinite(numeric)
              ? numeric.toLocaleString("vi-VN")
              : value;
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
