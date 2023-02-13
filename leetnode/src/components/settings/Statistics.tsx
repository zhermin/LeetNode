import { useState } from "react";

import {
  Group,
  Progress,
  ScrollArea,
  SegmentedControl,
  Table,
  Text
} from "@mantine/core";

interface TableReviewsProps {
  data: {
    topicSlug: string;
    masteryLevel: number;
  }[];
}

export default function Statistics({ data }: TableReviewsProps) {
  const [view, setView] = useState("bar");

  const rows = data.map((row) => {
    return (
      <tr key={row.topicSlug}>
        <td className="capitalize">{row.topicSlug.replace(/-/g, " ")}</td>
        <td>
          <Group position="apart">
            <Text size="xs" color="cyan" weight={700}>
              {row.masteryLevel}%
            </Text>
            <Text size="xs" color="red" weight={700}>
              {}%
            </Text>
          </Group>
          <Progress
            sections={[
              {
                value: row.masteryLevel * 100,
                color: "cyan",
              },
              {
                value: 0 * 100,
                color: "red",
              },
            ]}
          />
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <h1 className="text-center">Statistics</h1>
      <hr className="h-px my-4 bg-gray-200 border-0" />
      <Group position="right">
        <SegmentedControl
          value={view}
          onChange={setView}
          data={[
            { label: "Bar", value: "bar" },
            { label: "Radar", value: "week" },
            { label: "Pie Chart", value: "month" },
          ]}
        />
      </Group>
      <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
        <thead>
          <tr>
            <th className="w-1/3">Topic</th>
            <th>Mastery Level</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
