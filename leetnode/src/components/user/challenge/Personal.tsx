import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { UserData } from "@/components/Header";
import {
  Box,
  Center,
  Flex,
  Group,
  Loader,
  Paper,
  RingProgress,
  Text,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { User } from "@prisma/client";
import {
  IconCheck,
  IconCircleCheck,
  IconFlame,
  IconSquareCheck,
  IconSquareX,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

export default function Personal() {
  const session = useSession();

  const [date, setDate] = useState(new Date());

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery<UserData>({
    queryKey: ["userInfo", session?.data?.user?.id],
    queryFn: async () => {
      const res = await axios.post("/api/user", {
        id: session?.data?.user?.id,
      });
      return res?.data;
    },
    enabled: !!session?.data?.user?.id,
  });

  const {
    data: allUsers,
    isLoading: allUsersIsLoading,
    isError: allUsersIsError,
  } = useQuery<User[]>({
    queryKey: ["challenge"],
    queryFn: async () => {
      const res = await axios.get("/api/user/getAllUsersPoints");
      return res.data;
    },
  });

  if (
    !userInfo ||
    isLoading ||
    isError ||
    !allUsers ||
    allUsersIsLoading ||
    allUsersIsError
  ) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  // Pre-processing to render the calendar
  const lastActive = new Date(userInfo.lastActive ?? "");
  const startDateTime = new Date(userInfo.lastActive ?? "");
  startDateTime.setDate(lastActive.getDate() - userInfo.loginStreak + 1); // Start of login streak
  startDateTime.setHours(0, 0, 0, 0); // Set to midnight for comparison in the calendar
  lastActive.setHours(0, 0, 0, 0); // Set to midnight for comparison in the calendar

  return (
    <>
      <Paper
        withBorder
        radius="md"
        p="xs"
        className="m-3 grid grid-cols-1 items-center justify-center gap-6 md:grid-cols-3"
      >
        <Flex align="center" justify="center" ta="center" gap="md">
          <RingProgress
            size={80}
            thickness={5}
            sections={[
              {
                // Streak / days in entire (current) month
                value:
                  (userInfo.loginStreak /
                    new Date(
                      lastActive.getFullYear(),
                      lastActive.getMonth() + 1,
                      0
                    ).getDate()) *
                  100,
                color: "yellow",
              },
            ]}
            label={
              <Center>
                <IconFlame
                  size={24}
                  stroke={1.5}
                  className="animate-bounce fill-amber-300 stroke-orange-500"
                />
              </Center>
            }
          />
          <Box>
            <Text color="dimmed" size="sm" transform="uppercase" weight={700}>
              Login Streak
            </Text>
            <Text weight={700} size="lg">
              {userInfo.loginStreak}
            </Text>
          </Box>
        </Flex>
        <Box ta="center">
          <Text color="dimmed" size="sm" transform="uppercase" weight={700}>
            Leaderboard
          </Text>
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            (Resets in{" "}
            {new Date(
              lastActive.getFullYear(),
              lastActive.getMonth() + 1,
              0
            ).getDate() - lastActive.getDate()}{" "}
            days)
          </Text>
          <Center>
            <Text weight={700} size="lg" className="mr-2">
              #
              {allUsers
                ?.map((user: User) => {
                  return user?.id;
                })
                .indexOf(session?.data?.user?.id ?? "") + 1}
            </Text>
            <Text weight={500} size="sm" color="dimmed">
              ( {userInfo.points} 🔋)
            </Text>
          </Center>
        </Box>
        <Box ta="center">
          <Text color="dimmed" size="sm" transform="uppercase" weight={700}>
            Attempted Today
          </Text>
          <Center>
            {(userInfo.attempts[lastActive.toDateString()] ?? 0) > 0 ? (
              <IconSquareCheck stroke={1.5} color="green" />
            ) : (
              <IconSquareX stroke={1.5} color="red" />
            )}
          </Center>
        </Box>
      </Paper>

      <Group position="center">
        <Calendar
          value={date}
          onChange={(value) => setDate(value ?? new Date())}
          size="md"
          renderDay={(date) => {
            const day = date.getDate();

            return date >= startDateTime && date <= lastActive ? (
              date.toDateString() in userInfo.attempts ? (
                <Flex>
                  <IconCircleCheck size={14} stroke={3} color="green" />
                  {day}
                </Flex>
              ) : (
                <Flex>
                  <IconCheck size={12} stroke={4} color="orange" />
                  {day}
                </Flex>
              )
            ) : (
              <>{day}</>
            );
          }}
        />
      </Group>
    </>
  );
}
