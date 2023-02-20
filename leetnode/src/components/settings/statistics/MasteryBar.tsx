import { Group, Progress, ScrollArea, Table, Text } from "@mantine/core";

interface TableReviewsProps {
  data: {
    topicSlug: string;
    masteryLevel: number;
  }[];
}

export default function MasteryBar({ data }: TableReviewsProps) {
  const rows = data?.map((row) => {
    return (
      <tr key={row.topicSlug}>
        <td className="capitalize">{row.topicSlug.replace(/-/g, " ")}</td>
        <td>
          <Group position="apart">
            <Text size="xs" color="cyan" weight={700}>
              {row.masteryLevel * 100}%
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
