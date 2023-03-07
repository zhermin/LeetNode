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
    topicSlug: string;
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
    topic.topicSlug = topic.topicSlug
      .replace(/-/g, " ") // Remove -
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalise every word
    const splitLabel = topic.topicSlug.match(/(\S+\s*){1,3}/g); // Split into array of 3-word chunks
    label.push(splitLabel as string[]);
    masteryLevel.push(topic.masteryLevel * 100);
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
    <div className="h-[90vh]">
      <Radar
        data={mastery}
        options={{
          maintainAspectRatio: false,
          scales: {
            r: {
              pointLabels: {
                font: {
                  size: 12,
                },
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
