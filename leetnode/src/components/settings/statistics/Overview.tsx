import {
  Center,
  Group,
  Loader,
  Paper,
  RingProgress,
  Text
} from "@mantine/core";

interface MasteryProps {
  data: {
    topicSlug: string;
    masteryLevel: number;
  }[];
}

export default function Overview({ data }: MasteryProps) {
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
      <div className="grid gap-3 mb-6 grid-cols-2">
        <div>
          <Paper withBorder shadow="lg" radius="md" p="xs" key="highestMastery">
            <Group>
              <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[
                  {
                    value: highestMastery.masteryLevel * 100,
                    color: "green",
                  },
                ]}
                label={
                  <Center>
                    <Text className="font-bold">
                      {highestMastery.masteryLevel * 100}%
                    </Text>
                  </Center>
                }
              />

              <div>
                <Text
                  color="dimmed"
                  size="xs"
                  transform="uppercase"
                  weight={700}
                >
                  Highest Mastery
                </Text>
                <Text weight={700} size="xl" className="capitalize">
                  {highestMastery.topicSlug.replace(/-/g, " ")}
                </Text>
              </div>
            </Group>
          </Paper>
        </div>
        <div>
          <Paper withBorder shadow="lg" radius="md" p="xs" key="lowestMastery">
            <Group>
              <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[
                  {
                    value: lowestMastery.masteryLevel * 100,
                    color: "red",
                  },
                ]}
                label={
                  <Center>
                    <Text className="font-bold">
                      {lowestMastery.masteryLevel * 100}%
                    </Text>
                  </Center>
                }
              />

              <div>
                <Text
                  color="dimmed"
                  size="xs"
                  transform="uppercase"
                  weight={700}
                >
                  Lowest Mastery
                </Text>
                <Text weight={700} size="xl" className="capitalize">
                  {lowestMastery.topicSlug.replace(/-/g, " ")}
                </Text>
              </div>
            </Group>
          </Paper>
        </div>
      </div>
    );
  } else {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
}
