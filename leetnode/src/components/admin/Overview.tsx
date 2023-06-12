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
import { Bar } from "react-chartjs-2";

import {
  AttemptsInfoType,
  UsersWithMasteriesAndAttemptsType,
} from "@/pages/admin";
import { CourseWithMediaAndTopicType } from "@/pages/courses";
import {
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconUserCheck,
  IconUserExclamation,
  IconUserMinus,
  IconUserPlus,
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

const Overview = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  const [{ data: users }, { data: courses }, { data: attempts }] = useQueries({
    queries: [
      {
        queryKey: ["all-users-data"],
        queryFn: () =>
          axios.get<UsersWithMasteriesAndAttemptsType>("/api/user/admin"),
      },
      {
        queryKey: ["all-courses"],
        queryFn: () => axios.get<CourseWithMediaAndTopicType[]>("/api/course"),
      },
      {
        queryKey: ["all-attempts"],
        queryFn: () => axios.get<AttemptsInfoType>("/api/attempt/admin"),
      },
    ],
  });

  if (!users || !courses || !attempts) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  // Students flagged for more assistance
  const studentsWithTopicPing = users.data.filter((student) =>
    student.masteries.some((mastery) => mastery.topicPing)
  );
  const numStudentsWithTopicPing = studentsWithTopicPing.length;

  // Best and worst students based on mastery average
  const studentMasteryAverages = users.data
    .map((student) => {
      const masteryLevel = student.masteries.reduce(
        (total, mastery) => total + mastery.masteryLevel,
        0
      );
      const masteryAverage = masteryLevel / student.masteries.length || 0;
      return { name: student.username, masteryAverage };
    })
    .filter((student) => student.masteryAverage > 0)
    .sort((a, b) => b.masteryAverage - a.masteryAverage);

  // Sorted array of all topics based on all attempts by topic
  const topicAttempts = attempts.data.reduce((counts, attempt) => {
    const topicSlug = attempt.questionWithAddedTime.question.topicSlug;
    const key = counts[topicSlug];
    if (key) {
      key.correctCount += attempt.isCorrect ? 1 : 0;
      key.totalCount++;
    } else {
      counts[topicSlug] = {
        topicName: attempt.questionWithAddedTime.question.topic.topicName,
        correctCount: attempt.isCorrect ? 1 : 0,
        totalCount: 1,
      };
    }
    return counts;
  }, {} as Record<string, { topicName: string; correctCount: number; totalCount: number }>);

  const topicAttemptsArray = Object.entries(topicAttempts).map(
    ([topicSlug, { topicName, correctCount, totalCount }]) => ({
      topicSlug,
      topicName,
      correctCount,
      totalCount,
    })
  );

  return (
    <Container size="xl">
      <Flex justify="center" align="center" gap="xl" wrap="wrap" mt="xl">
        <Center>
          <Paper
            radius="md"
            p="lg"
            w={250}
            bg={theme.fn.rgba(theme.colors.yellow[3], 0.5)}
          >
            <Group py="md">
              {numStudentsWithTopicPing === 0 ? (
                <IconUserCheck />
              ) : (
                <IconUserExclamation />
              )}
              <div>
                <Text size="xs" transform="uppercase" weight={700}>
                  Students to help
                </Text>
                <Text weight={700} size="md">
                  {numStudentsWithTopicPing}/{users.data.length}
                </Text>
              </div>
            </Group>
          </Paper>
        </Center>
        <Center>
          <Paper
            radius="md"
            p="lg"
            w={250}
            bg={theme.fn.rgba(theme.colors.teal[3], 0.5)}
          >
            <Group py="md">
              <IconUserPlus />
              <div>
                <Text size="xs" transform="uppercase" weight={700}>
                  Best Student
                </Text>
                <Text weight={700} size="md">
                  {studentMasteryAverages[0]?.name}
                </Text>
              </div>
            </Group>
          </Paper>
        </Center>
        <Center>
          <Paper
            radius="md"
            p="lg"
            w={250}
            bg={theme.fn.rgba(theme.colors.red[3], 0.5)}
          >
            <Group py="md">
              <IconUserMinus />
              <div>
                <Text size="xs" transform="uppercase" weight={700}>
                  Weakest Student
                </Text>
                <Text weight={700} size="md">
                  {
                    studentMasteryAverages[studentMasteryAverages.length - 1]
                      ?.name
                  }
                </Text>
              </div>
            </Group>
          </Paper>
        </Center>
      </Flex>

      <Container my="xl" py="xl">
        <Title size="h2">% Correct by Topic</Title>
        <Bar
          datasetIdKey="id"
          data={{
            labels: topicAttemptsArray.map((topic) => topic.topicName),
            datasets: [
              {
                label: " % Correct",
                data: topicAttemptsArray
                  .sort(
                    (a, b) =>
                      b.correctCount / b.totalCount -
                        a.correctCount / a.totalCount || 0
                  )
                  .map((topic) => topic.correctCount / topic.totalCount),
                backgroundColor: theme.fn.rgba(theme.colors.green[4], 0.75),
              },
            ],
          }}
          options={{
            indexAxis: "y",
            scales: {
              y: {
                ticks: {
                  autoSkip: false,
                  font: {
                    size: mobile ? 10 : 14,
                  },
                },
                grid: {
                  display: false,
                },
              },
              x: {
                ticks: {
                  format: {
                    style: "percent",
                    maximumSignificantDigits: 3,
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
      </Container>

      <Container my="xl" py="xl">
        <Title size="h2"># Attempted by Topic</Title>
        <Bar
          datasetIdKey="id"
          data={{
            labels: topicAttemptsArray.map((topic) => topic.topicName),
            datasets: [
              {
                label: " # Attempts",
                data: topicAttemptsArray
                  .sort((a, b) => b.totalCount - a.totalCount)
                  .map((topic) => topic.totalCount),
              },
            ],
          }}
          options={{
            indexAxis: "y",
            scales: {
              y: {
                ticks: {
                  autoSkip: false,
                  font: {
                    size: mobile ? 10 : 14,
                  },
                },
                grid: {
                  display: false,
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
      </Container>
    </Container>
  );
};

export default Overview;
