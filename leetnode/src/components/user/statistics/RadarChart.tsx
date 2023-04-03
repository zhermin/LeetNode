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

import { useMantineTheme } from "@mantine/core";

interface MasteryProps {
  data: {
    topicName: string;
    masteryLevel: number;
  }[];
}

export default function RadarChart({ data }: MasteryProps) {
  const theme = useMantineTheme();

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
        backgroundColor: theme.fn.rgba(theme.colors.cyan[2], 0.2),
        borderColor: theme.colors.cyan[4],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="mt-4 h-screen">
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
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.gray[3]
                    : theme.colors.gray[8],
              },
              angleLines: {
                color: theme.colors.gray[3],
              },
              grid: {
                color: theme.colors.gray[3],
              },
              ticks: {
                backdropColor: theme.colors.gray[0],
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: false,
            },
          },
        }}
      />
    </div>
  );
}
