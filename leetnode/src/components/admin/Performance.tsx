import axios from "axios";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  PointElement,
  Title as ChartTitle,
  Tooltip,
} from "chart.js/auto";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";

import { UsersWithMasteriesAndAttemptsType } from "@/pages/admin";
import { DateDiffCalc } from "@/utils/DateDiffCalc";
import {
  Accordion,
  Anchor,
  Avatar,
  Box,
  Center,
  Checkbox,
  Container,
  createStyles,
  Flex,
  Group,
  Indicator,
  Loader,
  Paper,
  RingProgress,
  ScrollArea,
  Select,
  Table,
  Text,
} from "@mantine/core";
import { Mastery, Topic } from "@prisma/client";
import {
  IconChevronsDown,
  IconChevronsRight,
  IconChevronsUp,
  IconExclamationMark,
  IconMoodEmpty,
  IconMoodSad,
  IconMoodSmile,
} from "@tabler/icons";
import { useQueries } from "@tanstack/react-query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.font.size = 16;

const Performance = () => {
  const { classes } = useStyles();

  const [active, setActive] = useState("");
  const [userData, setUserData] = useState<UsersWithMasteriesAndAttemptsType>(
    []
  );
  const [masteryData, setMasteryData] = useState<number[]>([]);
  const [sort, setSort] = useState<string | null>("All Students");
  const [checkedHelp, setCheckedHelp] = useState(false);
  const [notif, setNotif] = useState(false);

  const [{ data: users }, { data: topics }] = useQueries({
    queries: [
      {
        queryKey: ["all-users"],
        queryFn: () =>
          axios.get<UsersWithMasteriesAndAttemptsType>("/api/user/admin"),
      },
      {
        queryKey: ["all-topics"],
        queryFn: () => axios.get<Topic[]>("/api/topic"),
      },
    ],
  });

  useEffect(() => {
    if (users) {
      setUserData(
        users.data.filter((user: { id: string }) => {
          return user.id == active;
        })
      );
    }
  }, [users, active]);

  if (!users || !topics) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  const students = users.data;

  {
    sort === "Last Active (Newest)"
      ? students.sort((a, b) => {
          return b.lastActive > a.lastActive ? 1 : -1;
        })
      : sort === "Last Active (Oldest)"
      ? students.sort((a, b) => {
          return a.lastActive > b.lastActive ? 1 : -1;
        })
      : students.sort((a, b) => {
          return a.username.localeCompare(b.username);
        });
  }

  let filteredStudents: UsersWithMasteriesAndAttemptsType = [];

  const studentsWithTopicPing = students.filter((student) => {
    return student.masteries.some(
      (mastery: { topicPing: boolean }) => mastery.topicPing === true
    );
  });

  const numStudentsWithTopicPing = studentsWithTopicPing.length;

  if (checkedHelp) {
    filteredStudents = studentsWithTopicPing;
  } else {
    filteredStudents = students;
  }

  const labelTopics: string[] = [];
  topics.data
    .sort((a: { topicSlug: string }, b: { topicSlug: string }) =>
      a.topicSlug.localeCompare(b.topicSlug)
    )
    .forEach((topic: { topicName: string }) =>
      labelTopics.push(topic.topicName)
    );

  const allData = [];
  for (let i = 0; i < labelTopics.length; ++i) {
    allData.push({
      label: labelTopics[i] as string,
      data: masteryData[i] as number,
    });
  }

  // Sort them by the data value
  allData.sort((a, b) => b.data - a.data);

  // And split them again
  const sortedLabels = allData.map((e) => e.label);
  const sortedData = allData.map((e) => e.data);

  // Look into componentMount if this still has multiple renders in production
  if (numStudentsWithTopicPing > 0 && !notif) {
    toast(
      `You have ${numStudentsWithTopicPing} student${
        numStudentsWithTopicPing === 1 ? "" : "s"
      } that require your help!`,
      { duration: 3000, icon: <IconExclamationMark /> }
    );
    setNotif(true);
  }

  // TODO: Change .then to async/await
  const handleClick = (data: {
    userId: string;
    topicSlug: string;
    newPing: boolean;
  }) => {
    axios
      .post("/api/admin/updatePing", data)
      .then()
      .catch((err) => {
        console.log(err);
      });
  };

  const topicAvgMasteryLevels: { topic: string; avgMasteryLevel: number }[] =
    [];
  topics.data.map((topic) => {
    let totalMasteryLevel = 0;
    let count = 0;
    users.data.map((user) => {
      const mastery = user.masteries.find(
        (mastery: Mastery) => mastery.topicSlug === topic.topicSlug
      );
      if (mastery && mastery.masteryLevel !== 0) {
        const masteryLevel = mastery.masteryLevel;
        totalMasteryLevel += masteryLevel;
        count++;
      }
    });
    if (count === 0) {
      topicAvgMasteryLevels.push({
        topic: topic.topicSlug,
        avgMasteryLevel: 0,
      });
    } else {
      const avgMasteryLevel = totalMasteryLevel / count;
      topicAvgMasteryLevels.push({
        topic: topic.topicSlug,
        avgMasteryLevel: avgMasteryLevel,
      });
    }
  });

  let counter = 0;
  userData[0]?.masteries.map((mastery) => {
    const topicAvgMastery = topicAvgMasteryLevels.find(
      (t: { topic: string; avgMasteryLevel: number }) =>
        t.topic === mastery.topicSlug
    );
    if (topicAvgMastery && topicAvgMastery.avgMasteryLevel !== 0) {
      if (mastery.masteryLevel - topicAvgMastery.avgMasteryLevel > 0) {
        counter++;
      } else if (mastery.masteryLevel - topicAvgMastery.avgMasteryLevel < 0) {
        counter--;
      }
    }
  });

  return (
    <ScrollArea>
      <Container size="lg">
        <Flex
          align="center"
          justify="space-between"
          pb="md"
          gap="md"
          wrap="wrap"
        >
          <Checkbox
            className="self-end"
            label="All students who need help!"
            checked={checkedHelp}
            onChange={(event) => setCheckedHelp(event.currentTarget.checked)}
          />
          <Select
            size="sm"
            label="Sort By"
            placeholder="Pick one"
            data={[
              { value: "All Students", label: "All Students" },
              {
                value: "Last Active (Newest)",
                label: "Last Active (Newest)",
              },
              {
                value: "Last Active (Oldest)",
                label: "Last Active (Oldest)",
              },
            ]}
            value={sort}
            onChange={setSort}
          />
        </Flex>
        <Accordion variant="filled">
          {filteredStudents.map((item) => (
            <Accordion.Item
              className={classes.item}
              value={item.username}
              key={item.id}
            >
              <Accordion.Control
                onClick={() => {
                  setActive(item.id);
                  setMasteryData(
                    item.masteries
                      .sort((a, b) => a.topicSlug.localeCompare(b.topicSlug))
                      .map((mastery) => mastery.masteryLevel)
                  );
                }}
              >
                <Group position="apart">
                  <Group spacing="sm">
                    {item?.masteries.some(
                      (mastery) => mastery.topicPing === true
                    ) ? (
                      <Indicator offset={4} color="red" withBorder>
                        <Avatar size="md" src={item.image} radius={40} />
                      </Indicator>
                    ) : (
                      <Avatar size="md" src={item.image} radius={40} />
                    )}

                    <div>
                      <Text size="sm" weight={500}>
                        {item.username}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {item.email}
                      </Text>
                    </div>
                  </Group>
                  {DateDiffCalc(item?.lastActive as Date)}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Center>
                  <Group pb={"lg"}>
                    <Paper withBorder radius="md" p="sm" h={100}>
                      <Group>
                        <RingProgress
                          size={80}
                          roundCaps
                          thickness={8}
                          sections={[
                            {
                              value:
                                (item.attempts.filter(
                                  (attempt) => attempt.isCorrect === true
                                ).length /
                                  item.attempts.length) *
                                100,
                              color:
                                (item.attempts.filter(
                                  (attempt) => attempt.isCorrect === true
                                ).length /
                                  item.attempts.length) *
                                  100 >=
                                70
                                  ? "green"
                                  : (item.attempts.filter(
                                      (attempt) => attempt.isCorrect === true
                                    ).length /
                                      item.attempts.length) *
                                      100 <=
                                    30
                                  ? "red"
                                  : "orange",
                            },
                          ]}
                          label={
                            <Center>
                              {(item.attempts.filter(
                                (attempt) => attempt.isCorrect === true
                              ).length /
                                item.attempts.length) *
                                100 >=
                              70 ? (
                                <IconChevronsUp size={22} stroke={1.5} />
                              ) : (item.attempts.filter(
                                  (attempt) => attempt.isCorrect === true
                                ).length /
                                  item.attempts.length) *
                                  100 <=
                                30 ? (
                                <IconChevronsDown size={22} stroke={1.5} />
                              ) : (
                                <IconChevronsRight size={22} stroke={1.5} />
                              )}
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
                            Overall correct %
                          </Text>
                          <Text weight={700} size="xl">
                            {item.attempts.length
                              ? (
                                  (item.attempts.filter(
                                    (attempt) => attempt.isCorrect === true
                                  ).length /
                                    item.attempts.length) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                    <Paper withBorder radius="md" p="sm" h={100}>
                      <Group py={"md"}>
                        {counter > 0 ? (
                          <IconMoodSmile size={40} color="green" />
                        ) : counter < 0 ? (
                          <IconMoodSad size={40} color="red" />
                        ) : (
                          <IconMoodEmpty size={40} color="orange" />
                        )}

                        <div>
                          <Text
                            color="dimmed"
                            size="xs"
                            transform="uppercase"
                            weight={700}
                          >
                            Comparative Performance
                          </Text>
                          {counter > 0 ? (
                            <Text weight={700} size="xl">
                              Above Average
                            </Text>
                          ) : counter < 0 ? (
                            <Text weight={700} size="xl">
                              Below Average
                            </Text>
                          ) : (
                            <Text weight={700} size="xl">
                              Average
                            </Text>
                          )}
                        </div>
                      </Group>
                    </Paper>
                  </Group>
                </Center>
                <Box>
                  <Bar
                    datasetIdKey="id"
                    data={{
                      labels: sortedLabels,
                      datasets: [
                        {
                          label: "Mastery Level",
                          data: sortedData,
                          backgroundColor: "rgba(0, 128, 128, 0.75)",
                          borderColor: "rgba(0, 128, 128, 0.75)",
                          borderWidth: 1,
                          barPercentage: 0.8,
                          categoryPercentage: 0.7,
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      indexAxis: "y",
                      scales: {
                        y: {
                          ticks: {
                            autoSkip: false,
                          },
                          grid: {
                            display: false,
                          },
                        },
                        x: {
                          max: 1,
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return value.toLocaleString(undefined, {
                                style: "percent",
                              });
                            },
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>
                <Paper withBorder radius="md" p="sm" mt={"md"}>
                  <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
                    <thead>
                      <tr>
                        <th>Topic</th>
                        <th>Difficulty</th>
                        <th>Need Help?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topics.data.map((t) => (
                        <tr key={t.topicSlug}>
                          <td>
                            <Anchor<"a">
                              size="sm"
                              onClick={(event) => event.preventDefault()}
                            >
                              {t.topicName}
                            </Anchor>
                          </td>
                          <td>{t.topicLevel}</td>

                          <td>
                            <Checkbox
                              defaultChecked={
                                userData[0]?.masteries.some(
                                  (m) => m.topicSlug === t.topicSlug
                                ) &&
                                userData[0]?.masteries.find(
                                  (m) => m.topicSlug === t.topicSlug
                                )?.topicPing
                              }
                              onChange={() => {
                                handleClick({
                                  userId: userData[0]?.id as string,
                                  topicSlug: t.topicSlug,
                                  newPing: !(
                                    userData[0]?.masteries.some(
                                      (m) => m.topicSlug === t.topicSlug
                                    ) &&
                                    userData[0]?.masteries.find(
                                      (m) => m.topicSlug === t.topicSlug
                                    )?.topicPing
                                  ) as boolean,
                                });
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Paper>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </ScrollArea>
  );
};

export default Performance;

const useStyles = createStyles((theme) => ({
  item: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,

    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
}));
