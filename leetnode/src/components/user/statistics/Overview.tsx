import { Center, Paper, RingProgress, Text } from "@mantine/core";

interface OverviewProps {
  data: {
    topicName: string;
    masteryLevel: number;
  }[];
}

export default function Overview({ data }: OverviewProps) {
  // reduce will throw an error is data is not an array
  if (data?.length > 0) {
    const highestMastery = data?.reduce((max, topic) =>
      max.masteryLevel > topic.masteryLevel ? max : topic
    );
    // Get the topic with the lowest mastery where lowest mastery !== 0
    const lowestMastery = data?.reduce((min, topic) =>
      topic.masteryLevel === 0
        ? min
        : min.masteryLevel < topic.masteryLevel
        ? min
        : topic
    );

    return (
      <div className="m-3 grid grid-cols-1 gap-3 lg:grid-cols-2 ">
        <Paper
          withBorder
          shadow="lg"
          radius="md"
          p="xs"
          key="highestMastery"
          className="flex flex-row items-center"
        >
          <RingProgress
            className="w-20%"
            size={80}
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
                <Text className="font-bold">
                  {highestMastery.masteryLevel}%
                </Text>
              </Center>
            }
          />
          <div className="ml-3">
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              Highest Mastery
            </Text>
            <Text weight={700} size="lg">
              {highestMastery.topicName}
            </Text>
          </div>
        </Paper>

        <Paper
          withBorder
          shadow="lg"
          radius="md"
          p="xs"
          key="lowestMastery"
          className="flex flex-row items-center"
        >
          <RingProgress
            size={80}
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
          <div className="ml-3">
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              Lowest Mastery
            </Text>
            <Text weight={700} size="lg">
              {lowestMastery.topicName}
            </Text>
          </div>
        </Paper>
      </div>
    );
  } else {
    return <Center>No mastery found</Center>;
  }
}
