import { Center, Group, Paper, RingProgress, Text } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import {
  IconCheckbox,
  IconCircleCheck,
  IconFlame,
  IconSquare,
} from "@tabler/icons";

interface PersonalProps {
  userInfo: {
    id: string;
    name: string;
    image: string;
    lastActive: Date;
    loginStreak: number;
    firstQuestion: boolean;
    points: number;
    index: number;
  };
}

export default function Personal({ userInfo }: PersonalProps) {
  const lastActive = new Date(userInfo.lastActive);

  return (
    <div>
      <Paper
        withBorder
        shadow="lg"
        radius="md"
        p="xs"
        key="userInfo"
        className="m-3 grid grid-cols-3 items-center justify-center"
      >
        <div className="text-center flex flex-row items-center justify-center">
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[
              {
                // streak / days in entire (current) month
                value:
                  (userInfo.loginStreak /
                    new Date(
                      lastActive.getFullYear(),
                      lastActive.getMonth(),
                      0
                    ).getDate()) *
                  100,
                color: "orange",
              },
            ]}
            label={
              <Center>
                <IconFlame
                  className="animate-bounce text-orange-500 fill-amber-500"
                  size="2rem"
                />
              </Center>
            }
          />
          <div className="ml-2">
            <Text color="dimmed" size="sm" transform="uppercase" weight={700}>
              Current Streak
            </Text>
            <Text weight={700} size="lg">
              {userInfo.loginStreak}
            </Text>
          </div>
        </div>
        <div className="text-center">
          <Text color="dimmed" size="sm" transform="uppercase" weight={700}>
            Position
          </Text>
          <Center>
            <Text weight={700} size="lg" className="mr-1">
              #{userInfo.index + 1}
            </Text>
            <Text weight={700} size="sm" color="grey">
              ({userInfo.points}⚡)
            </Text>
          </Center>
        </div>
        <div className="text-center">
          <Text color="dimmed" size="sm" transform="uppercase" weight={700}>
            Question attempted today
          </Text>
          <Center>
            {userInfo.firstQuestion === false ? (
              <IconCheckbox color="green" />
            ) : (
              <IconSquare color="orange" />
            )}
          </Center>
        </div>
      </Paper>

      <Group position="center">
        <Calendar
          size="xl"
          onChange={() => {
            return null; // Do nothing
          }}
          minDate={new Date(lastActive.getFullYear(), lastActive.getMonth())}
          maxDate={
            new Date(lastActive.getFullYear(), lastActive.getMonth() + 1)
          }
          renderDay={(date) => {
            const day = date.getDate();

            return day > lastActive.getDate() - userInfo.loginStreak &&
              day <= lastActive.getDate() ? (
              <Center>
                <IconCircleCheck />
              </Center>
            ) : (
              <>{day}</>
            );
          }}
        />
      </Group>
    </div>
  );
}
