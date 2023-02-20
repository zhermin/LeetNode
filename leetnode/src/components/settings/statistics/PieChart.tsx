import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

interface MasteryProps {
  data: {
    topicSlug: string;
    masteryLevel: number;
  }[];
}

export default function PieChart({ data }: MasteryProps) {
  ChartJS.register(ArcElement, Tooltip, Legend);

  function random_rgba() {
    const o = Math.round,
      r = Math.random,
      s = 255;
    return (
      "rgba(" +
      o(r() * s) +
      "," +
      o(r() * s) +
      "," +
      o(r() * s) +
      "," +
      r().toFixed(1) +
      ")"
    );
  }

  const label: string[] = [];
  const masteryLevel: number[] = [];
  const colour: string[] = [];
  data?.map((topic) => {
    label.push(
      topic.topicSlug
        .replace(/-/g, " ") // Remove -
        .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalise every word
    );
    masteryLevel.push(topic.masteryLevel * 100);
    colour.push(random_rgba());
  });

  const mastery = {
    labels: label,
    datasets: [
      {
        label: "Mastery Level",
        data: masteryLevel,
        backgroundColor: colour,
        borderColor: "gray",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="h-[70vh] mt-5">
      <Pie
        data={mastery}
        options={{
          maintainAspectRatio: false,
          plugins: { legend: { position: "right" } },
        }}
      />
    </div>
  );
}
