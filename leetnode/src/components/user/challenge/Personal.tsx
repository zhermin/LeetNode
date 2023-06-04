import axios from "axios";
import { useSession } from "next-auth/react";

import { UserData } from "@/components/Header";
import {
  Center,
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
  IconCheckbox,
  IconChecks,
  IconFlame,
  IconSquare,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

export default function Personal() {
  const session = useSession();

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
  const lastActive = new Date(userInfo.lastActive ?? ""); // lastActive
  const startDateTime = new Date(userInfo.lastActive ?? "");
  startDateTime.setDate(lastActive.getDate() - userInfo.loginStreak + 1); // Start of login streak
  startDateTime.setHours(0, 0, 0, 0); // Set to midnight for comparison in the calendar
  lastActive.setHours(0, 0, 0, 0); // Set to midnight for comparison in the calendar

  return (
    <div>
      <Paper
        withBorder
        shadow="lg"
        radius="md"
        p="xs"
        key="userInfo"
        className="m-3 grid grid-cols-1 items-center justify-center gap-6 md:grid-cols-3"
      >
        <div className="flex flex-row items-center justify-center text-center">
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
                      lastActive.getMonth() + 1,
                      0
                    ).getDate()) *
                  100,
                color: "orange",
              },
            ]}
            label={
              <Center>
                <IconFlame
                  className="animate-bounce fill-amber-500 text-orange-500"
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
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            (
            {new Date(
              lastActive.getFullYear(),
              lastActive.getMonth() + 1,
              0
            ).getDate() - lastActive.getDate()}{" "}
            days till reset)
          </Text>
          <Center>
            <Text weight={700} size="lg" className="mr-1">
              #
              {allUsers
                ?.map((user: User) => {
                  return user?.id;
                })
                .indexOf(session?.data?.user?.id ?? "") + 1}
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
            {(userInfo.attempts[lastActive.toDateString()] ?? 0) > 0 ? (
              <IconCheckbox color="green" />
            ) : (
              <IconSquare color="orange" />
            )}
          </Center>
        </div>
      </Paper>

      <Group position="center">
        <Calendar
          size="md"
          onChange={() => {
            return null; // Do nothing
          }}
          renderDay={(date) => {
            const day = date.getDate();

            return date >= startDateTime && date <= lastActive ? (
              date.toDateString() in userInfo.attempts ? (
                <div className="flex">
                  <IconChecks color="green" />
                  {day}
                </div>
              ) : (
                <div className="flex">
                  <IconCheck color="orange" />
                  {day}
                </div>
              )
            ) : (
              <>{day}</>
            );
          }}
        />
      </Group>
    </div>
  );
}
