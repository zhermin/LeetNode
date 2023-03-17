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
  CoursesInfoType,
  UsersWithMasteriesAndAttemptsType,
} from "@/pages/admin";
import {
  Box,
  Center,
  Container,
  Grid,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import {
  IconHandClick,
  IconUserCheck,
  IconUserExclamation,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons";

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

const Overview = ({
  users,
  courses,
  attempts,
}: {
  users: UsersWithMasteriesAndAttemptsType;
  courses: CoursesInfoType[];
  attempts: AttemptsInfoType;
}) => {
  console.log(attempts);

  const students = users.slice();

  const studentsWithTopicPing = students.filter((student) => {
    return student.masteries.some(
      (mastery: { topicPing: boolean }) => mastery.topicPing === true
    );
  });

  const numStudentsWithTopicPing = studentsWithTopicPing.length;
  console.log(students);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const attemptsWithinPastWeek = attempts.filter(
    (attempt) => new Date(attempt.submittedAt) > oneWeekAgo
  );

  const topicSlugCounts = attemptsWithinPastWeek.reduce(
    (counts: { [key: string]: number }, attempt) => {
      const topicSlug = attempt.question.topicSlug;
      counts[topicSlug] = (counts[topicSlug] || 0) + 1;
      return counts;
    },
    {}
  );

  const mostCommonTopicSlug = Object.entries(topicSlugCounts).reduce(
    (mostCommon, current) => {
      return current[1] > mostCommon[1] ? current : mostCommon;
    },
    ["", 0]
  )[0];

  console.log(mostCommonTopicSlug);
  let mostCommonTopicName: string | undefined = "";
  if (mostCommonTopicSlug !== "") {
    mostCommonTopicName = courses
      .find((c) =>
        c.topics.some((topic) => topic.topicSlug === mostCommonTopicSlug)
      )
      ?.topics.find(
        (topic) => topic.topicSlug === mostCommonTopicSlug
      )?.topicName;
  }

  console.log(mostCommonTopicName);

  let bestStudent = "";
  let worstStudent = "";
  let bestMasteryLevel = -1;
  let worstMasteryLevel = 1;

  for (const student of students) {
    const masteryLevel = student.masteries.reduce(
      (total, mastery) => total + mastery.masteryLevel,
      0
    );
    const masteryAverage = masteryLevel / student.masteries.length;

    if (masteryAverage > bestMasteryLevel) {
      bestMasteryLevel = masteryAverage;
      bestStudent = student.name;
    }

    if (masteryAverage < worstMasteryLevel && masteryAverage > 0) {
      worstMasteryLevel = masteryAverage;
      worstStudent = student.name;
    }
  }

  // Step 1: Create a map to store the number of correct attempts and total attempts for each course.
  const courseCounts = new Map();
  courses.forEach((course) =>
    courseCounts.set(course.courseSlug, { correctCount: 0, totalCount: 0 })
  );

  // Step 2: Iterate over the attempts array, and for each attempt, check if it is correct and belongs to a topic in a course. If it does, increment the count for that course in the map.
  attempts.forEach((attempt) => {
    const { isCorrect, question } = attempt;
    if (isCorrect) {
      const topic = question.topicSlug;
      const course = courses.find((c) =>
        c.topics.some((t) => t.topicSlug === topic)
      );
      if (course) {
        const courseData = courseCounts.get(course.courseSlug);
        courseCounts.set(course.courseSlug, {
          correctCount: courseData.correctCount + 1,
          totalCount: courseData.totalCount + 1,
        });
      }
    } else {
      const topic = question.topicSlug;
      const course = courses.find((c) =>
        c.topics.some((t) => t.topicSlug === topic)
      );
      if (course) {
        const courseData = courseCounts.get(course.courseSlug);
        courseCounts.set(course.courseSlug, {
          ...courseData,
          totalCount: courseData.totalCount + 1,
        });
      }
    }
  });

  // Step 3: Sort the map by the count of correct attempts in descending order.
  const sortedCounts = [...courseCounts.entries()].sort(
    (a, b) => b[1].correctCount - a[1].correctCount
  );

  // Step 4: Extract the top 3 and bottom 3 courses from the sorted map, and calculate the average percentage of correct attempts for each course.
  const top3Courses = sortedCounts
    .slice(0, 3)
    .map(([slug, { correctCount, totalCount }]) => {
      const course = courses.find((c) => c.courseSlug === slug);
      const averagePercentage =
        totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
      return { ...course, averagePercentage };
    });
  const bottom3Courses = sortedCounts
    .slice(-3)
    .map(([slug, { correctCount, totalCount }]) => {
      const course = courses.find((c) => c.courseSlug === slug);
      const averagePercentage =
        totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
      return { ...course, averagePercentage };
    });

  console.log("Top 3 courses:", top3Courses);
  console.log("Bottom 3 courses:", bottom3Courses);

  const top3CoursesLabel: (string | undefined)[] = [];
  top3Courses.map((course) => {
    // if (course.averagePercentage > 0) {
    top3CoursesLabel.push(course.courseName);
    // }
  });

  const bottom3CoursesLabel: (string | undefined)[] = [];
  bottom3Courses.map((course) => {
    // if (course.averagePercentage > 0) {
    bottom3CoursesLabel.push(course.courseName);
    // }
  });

  const top3CoursesData: (number | undefined)[] = [];
  top3Courses.map((course) => {
    if (course.averagePercentage > 0) {
      top3CoursesData.push(course.averagePercentage / 100);
    } else {
      top3CoursesData.push(0);
    }
  });

  const bottom3CoursesData: (number | undefined)[] = [];
  bottom3Courses.map((course) => {
    if (course.averagePercentage > 0) {
      bottom3CoursesData.push(course.averagePercentage / 100);
    } else {
      bottom3CoursesData.push(0);
    }
  });

  console.log(top3CoursesData);
  console.log(bottom3CoursesData);
  return (
    <Container size="xl">
      <Grid gutter="lg">
        <Grid.Col span={3}>
          <Center>
            <Paper withBorder radius="md" p="sm" h={100} w={300}>
              <Group py={"md"}>
                {numStudentsWithTopicPing === 0 ? (
                  <IconUserCheck />
                ) : (
                  <IconUserExclamation />
                )}
                <div>
                  <Text
                    color="dimmed"
                    size="xs"
                    transform="uppercase"
                    weight={700}
                  >
                    Students to help
                  </Text>
                  <Text weight={700} size="xl">
                    {numStudentsWithTopicPing}/{users.length}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Center>
        </Grid.Col>
        <Grid.Col span={3}>
          <Center>
            <Paper withBorder radius="md" p="sm" h={100} w={300}>
              <Group py={"md"}>
                <IconHandClick />
                <div>
                  <Text
                    color="dimmed"
                    size="xs"
                    transform="uppercase"
                    weight={700}
                  >
                    Recent top topic
                  </Text>
                  <Text weight={700} size="xl">
                    {mostCommonTopicName === ""
                      ? "No topic!"
                      : mostCommonTopicName}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Center>
        </Grid.Col>
        <Grid.Col span={3}>
          <Center>
            <Paper withBorder radius="md" p="sm" h={100} w={300}>
              <Group py={"md"}>
                <IconUserPlus />
                <div>
                  <Text
                    color="dimmed"
                    size="xs"
                    transform="uppercase"
                    weight={700}
                  >
                    Best Student
                  </Text>
                  <Text weight={700} size="xl">
                    {bestStudent}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Center>
        </Grid.Col>
        <Grid.Col span={3}>
          <Center>
            <Paper withBorder radius="md" p="sm" h={100} w={300}>
              <Group py={"md"}>
                <IconUserMinus />
                <div>
                  <Text
                    color="dimmed"
                    size="xs"
                    transform="uppercase"
                    weight={700}
                  >
                    Weakest Student
                  </Text>
                  <Text weight={700} size="xl">
                    {worstStudent}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Center>
        </Grid.Col>
      </Grid>
      {/* <Grid grow gutter="lg">
        <Grid.Col className={classes.gridChart} span={4}> */}
      <Container mt={"xl"}>
        <Title size={"h2"}>Top 3 Courses</Title>
        <Box my={"md"}>
          <Bar
            datasetIdKey="id"
            data={{
              labels: top3CoursesLabel,
              datasets: [
                {
                  label: "Top 3 Courses",
                  data: top3CoursesData,
                  backgroundColor: "rgb(119, 221, 119)",
                  borderColor: "rgb(119, 221, 119)",
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
      </Container>
      <Container mt={"xl"}>
        <Title size={"h2"}>Bottom 3 Courses</Title>
        <Box my={"md"}>
          <Bar
            datasetIdKey="id"
            data={{
              labels: bottom3CoursesLabel,
              datasets: [
                {
                  label: "Bottom 3 Courses",
                  data: bottom3CoursesData,
                  backgroundColor: "rgb(255, 121, 116)",
                  borderColor: "rgb(255, 121, 116))",
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
      </Container>
    </Container>
  );
};

export default Overview;
