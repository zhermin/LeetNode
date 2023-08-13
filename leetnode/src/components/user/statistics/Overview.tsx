import { Box, Center, Paper, RingProgress, Text } from "@mantine/core";

interface OverviewProps {
  masteryData: {
    topicName: string;
    masteryLevel: number;
  }[];
}

export default function Overview({ masteryData }: OverviewProps) {
  if (!masteryData || masteryData.length == 0)
    return <Center>No mastery found</Center>;

  const highestMastery = masteryData?.reduce((max, topic) =>
    max.masteryLevel > topic.masteryLevel ? max : topic
  );

  // Get the topic with the lowest mastery where lowest mastery !== 0
  const lowestMastery = masteryData?.reduce((min, topic) =>
    topic.masteryLevel === 0
      ? min
      : min.masteryLevel < topic.masteryLevel
      ? min
      : topic
  );

  return (
    <Box className="my-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Paper
        withBorder
        radius="md"
        p="xs"
        key="highestMastery"
        className="flex flex-row items-center"
      >
        <RingProgress
          size={120}
          roundCaps
          thickness={8}
          sections={[
            {
              value: highestMastery.masteryLevel,
              color: "green",
            },
          ]}
          label={
            <Center>
              <Text className="font-bold">{highestMastery.masteryLevel}%</Text>
            </Center>
          }
        />
        <Box className="ml-3">
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            Highest Mastery
          </Text>
          <Text weight={700} size="lg">
            {highestMastery.topicName}
          </Text>
        </Box>
      </Paper>

      <Paper
        withBorder
        radius="md"
        p="xs"
        key="lowestMastery"
        className="flex flex-row items-center"
      >
        <RingProgress
          size={120}
          roundCaps
          thickness={8}
          sections={[
            {
              value: lowestMastery.masteryLevel,
              color: "red",
            },
          ]}
          label={
            <Center>
              <Text className="font-bold">{lowestMastery.masteryLevel}%</Text>
            </Center>
          }
        />
        <Box className="ml-3">
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            Lowest Mastery
          </Text>
          <Text weight={700} size="lg">
            {lowestMastery.topicName}
          </Text>
        </Box>
      </Paper>
    </Box>
  );
}
