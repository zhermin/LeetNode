import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import React from "react";
import { Radar } from "react-chartjs-2";

interface MasteryProps {
  data: {
    topicName: string;
    masteryLevel: number;
  }[];
}

export default function RadarChart({ data }: MasteryProps) {
  ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  );

  const label: string[][] = [];
  const masteryLevel: number[] = [];
  data.map((topic) => {
    const splitLabel = topic.topicName.match(/(\S+\s*){1,3}/g); // Split into array of 3-word chunks
    label.push(splitLabel as string[]);
    masteryLevel.push(topic.masteryLevel);
  });
  const mastery = {
    labels: label,
    datasets: [
      {
        label: "Mastery Level",
        data: masteryLevel,
        backgroundColor: "rgba(153, 233, 242, 0.2)",
        borderColor: "rgba(153, 233, 242, 1)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="h-screen">
      <Radar
        data={mastery}
        options={{
          maintainAspectRatio: false,
          scales: {
            r: {
              pointLabels: {
                font: {
                  size: 11,
                },
                color: "#868E96",
              },
              angleLines: {
                color: "#CED4DA",
              },
              grid: {
                color: "#CED4DA",
              },
              ticks: {
                backdropColor: "#FFFFFF",
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: false, // Off the tooltip
            },
          },
        }}
      />
    </div>
  );
}
