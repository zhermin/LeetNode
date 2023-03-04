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
import Image from "next/image";
import { useState } from "react";
import Latex from "react-latex-next";

import {
  Accordion,
  Button,
  Card,
  Center,
  Container,
  createStyles,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Answer,
  Attempt,
  Course,
  Mastery,
  Question,
  QuestionMedia,
  QuestionWithAddedTime,
  Role,
  Topic,
  User,
  UserCourseQuestion,
} from "@prisma/client";
import {
  IconCheck,
  IconPlus,
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconUsers,
  IconX,
  IconZoomQuestion,
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

type CourseInfoType = Course & {
  topics: Topic[];
  userCourseQuestions: UserCourseQuestion[];
};

interface UsersWithMasteriesAndAttempts {
  id: string;
  nusnetId: string | null;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string;
  lastActive: string;
  role: Role;
  masteries: Mastery[];
  attempts: Attempt[];
}
[];

type AttemptsInterface = Attempt & {
  user: User;
  question: Question;
  answer: Question;
};

type QuestionsInterface = Question & {
  attempts: Attempt[];
  questionMedia: QuestionMedia[];
  answers: Answer[];
  questionsWithAddedTime: QuestionWithAddedTime[];
};

interface CoursesProps {
  courses: CourseInfoType[];
  users: UsersWithMasteriesAndAttempts[];
  attempts: AttemptsInterface[];
  questions: QuestionsInterface[];
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 34,
    fontWeight: 900,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24,
    },
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  card: {
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
    },
  },
  action: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
  },

  item: {
    backgroundColor: theme.white,
    borderBottom: 0,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.xs,
    overflow: "hidden",
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1]
    }`,
  },

  control: {
    fontSize: theme.fontSizes.lg,
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
    color: theme.black,

    "&:hover": {
      backgroundColor: "transparent",
    },
  },

  image: {
    filter: theme.colorScheme === "dark" ? "invert(1)" : "none",
  },
}));

const Courses = ({ courses, users, attempts, questions }: CoursesProps) => {
  const { classes } = useStyles();

  const [sort, setSort] = useState("All Courses");
  const [opened, setOpened] = useState(false);
  const [details, setDetails] = useState<CourseInfoType | null>();
  const [multiValue, setMultiValue] = useState<string[]>([]);

  console.log(users);

  let filteredCourses;
  {
    sort === "All Courses"
      ? (filteredCourses = courses)
      : (filteredCourses = courses.filter((c) => c.courseLevel === sort));
  }

  console.log(questions);

  const data: string[] = [];

  details?.topics.map((topic) => {
    data.push(topic.topicName);
  });

  const filteredTopics = details?.topics.filter((topic) =>
    multiValue.includes(topic.topicName)
  );

  console.log(courses);

  const avgMasteryLevels: {
    topicName: string;
    topicSlug: string;
    avgMasteryLevel: number;
  }[] = [];

  if (filteredTopics !== undefined) {
    filteredTopics.forEach((topic) => {
      const masteryLevels: number[] = [];

      users.forEach((user) => {
        const mastery = user.masteries.find(
          (m) => m.topicSlug === topic.topicSlug
        );
        if (mastery !== undefined && mastery.masteryLevel !== null) {
          masteryLevels.push(mastery.masteryLevel);
        }
      });

      if (masteryLevels.length > 0) {
        const avgMasteryLevel =
          masteryLevels.reduce((a, b) => a + b) / masteryLevels.length;
        avgMasteryLevels.push({
          topicName: topic.topicName,
          topicSlug: topic.topicSlug,
          avgMasteryLevel: avgMasteryLevel,
        });
      }
    });

    console.log(avgMasteryLevels);
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={details?.courseName}
        size="70%"
      >
        <Group px={"md"}>
          <Paper withBorder radius="md" p="sm" h={100}>
            <Group py={"md"}>
              <IconUsers />

              <div>
                <Text
                  color="dimmed"
                  size="xs"
                  transform="uppercase"
                  weight={700}
                >
                  Number of students who attempted
                </Text>
                <Text weight={700} size="xl">
                  {`${
                    Array.from(
                      new Set(
                        attempts
                          .filter((user) =>
                            details?.topics.some(
                              (topic) =>
                                topic.topicSlug === user.question.topicSlug
                            )
                          )
                          .map((user) => user.userId)
                      )
                    ).length
                  }/${users.length}`}
                </Text>
              </div>
            </Group>
          </Paper>
        </Group>
        <MultiSelect
          value={multiValue}
          onChange={setMultiValue}
          data={data}
          label="Selected Topics"
          placeholder="Pick all the topics that you'd like to show"
          px={"md"}
          py={"md"}
          defaultValue={data}
        />
        {avgMasteryLevels.map((topic) => (
          <Paper
            withBorder
            radius="md"
            my="lg"
            p="sm"
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.colors.gray[0],
            })}
            key={topic.topicSlug} // Add a unique key to each element
          >
            <Group py={"md"} position="apart">
              <Group>
                <IconUsers />
                <Text size="md" weight={700} color="dimmed">
                  Average {topic.topicName} Mastery
                </Text>
              </Group>
              {topic.avgMasteryLevel !== 0 ? (
                <Text size="md" weight={500}>
                  {(topic.avgMasteryLevel * 100).toFixed(2)}/100
                </Text>
              ) : (
                <Text size="md" weight={500}>
                  No Mastery Yet!
                </Text>
              )}
            </Group>

            <Progress
              value={topic.avgMasteryLevel * 100}
              size="lg"
              radius="xl"
            />
            {questions.filter(
              (q) =>
                q.questionsWithAddedTime.some(
                  (qt) => qt.courseSlug === details?.courseSlug
                ) && q.topicSlug === topic.topicSlug
            ).length > 0 ? (
              <Accordion
                mt={"lg"}
                chevronPosition="right"
                chevronSize={50}
                variant="separated"
                disableChevronRotation
                chevron={
                  <ThemeIcon radius="xl" size={32}>
                    <IconPlus size={18} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                <Accordion.Item
                  className={classes.item}
                  value="display-questions"
                >
                  <Accordion.Control>Display Questions</Accordion.Control>
                  <Accordion.Panel>
                    <Accordion>
                      {questions
                        .filter(
                          (question) =>
                            question.questionsWithAddedTime.some(
                              (q) => q.courseSlug === details?.courseSlug
                            ) && question.topicSlug === topic.topicSlug
                        )
                        .map((question) =>
                          question.variationId === 0 ? (
                            <Accordion.Item
                              value={String(question.questionId)}
                              key={question.questionId}
                            >
                              <Accordion.Control>
                                <Group my={"xs"} position="apart">
                                  <Title size={"xs"}>
                                    Question ID: {question.questionId}
                                  </Title>
                                  <Text>
                                    Total Number of Attempts:{" "}
                                    {question.attempts.length}
                                  </Text>
                                </Group>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Text>
                                  <Latex>{question.questionContent}</Latex>
                                </Text>
                                <Image
                                  src={
                                    question.questionMedia[0]
                                      ?.questionMediaURL ?? ""
                                  }
                                  alt={question.questionContent ?? ""}
                                  width="0"
                                  height="0"
                                  sizes="100vw"
                                  className={`my-8 h-auto w-1/3 rounded-lg ${classes.image}`}
                                />
                                <Tabs
                                  defaultValue={String(
                                    question.answers[0]?.optionNumber
                                  )}
                                  orientation="vertical"
                                  unstyled
                                  styles={(theme) => ({
                                    tab: {
                                      ...theme.fn.focusStyles(),
                                      backgroundColor:
                                        theme.colorScheme === "dark"
                                          ? theme.colors.dark[6]
                                          : theme.white,
                                      color:
                                        theme.colorScheme === "dark"
                                          ? theme.colors.dark[0]
                                          : theme.colors.gray[9],
                                      border: `1px solid ${
                                        theme.colorScheme === "dark"
                                          ? theme.colors.dark[6]
                                          : theme.colors.gray[4]
                                      }`,
                                      padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                                      cursor: "pointer",
                                      fontSize: theme.fontSizes.sm,
                                      display: "flex",
                                      alignItems: "center",

                                      "&:disabled": {
                                        opacity: 0.5,
                                        cursor: "not-allowed",
                                      },

                                      "&:not(:first-of-type)": {
                                        borderLeft: 0,
                                      },

                                      "&:first-of-type": {
                                        borderTopLeftRadius: theme.radius.md,
                                        borderBottomLeftRadius: theme.radius.md,
                                      },

                                      "&:last-of-type": {
                                        borderTopRightRadius: theme.radius.md,
                                        borderBottomRightRadius:
                                          theme.radius.md,
                                      },

                                      "&[data-active]": {
                                        backgroundColor: theme.colors.cyan[5],
                                        borderColor: theme.colors.cyan[5],
                                        color: theme.white,
                                      },
                                    },

                                    tabIcon: {
                                      marginRight: theme.spacing.xs,
                                      display: "flex",
                                      alignItems: "center",
                                    },

                                    tabsList: {
                                      display: "flex",
                                    },
                                  })}
                                >
                                  <Tabs.List mb={"xl"}>
                                    {question.answers.map((answer) => (
                                      <Tabs.Tab
                                        key={answer.optionNumber}
                                        value={String(answer.optionNumber)}
                                        icon={
                                          answer.isCorrect ? (
                                            <ThemeIcon
                                              color={"green.7"}
                                              size={"sm"}
                                            >
                                              <IconCheck
                                                size={18}
                                                color={"white"}
                                              />
                                            </ThemeIcon>
                                          ) : (
                                            <ThemeIcon
                                              color={"red"}
                                              size={"sm"}
                                            >
                                              <IconX
                                                size={18}
                                                color={"white"}
                                              />
                                            </ThemeIcon>
                                          )
                                        }
                                      >
                                        Option {String(answer.optionNumber)}
                                      </Tabs.Tab>
                                    ))}
                                  </Tabs.List>
                                  {question.answers.map((answer) => (
                                    <Tabs.Panel
                                      key={String(answer.optionNumber)}
                                      value={String(answer.optionNumber)}
                                      pl={"xs"}
                                    >
                                      <>
                                        <Divider size="xs" my={"lg"} />
                                        <Text>
                                          Option Detail:{" "}
                                          <Latex>{answer.answerContent}</Latex>
                                        </Text>
                                        <Divider size="xs" my={"lg"} />
                                        <Text>
                                          Number of Attempts:{" "}
                                          {
                                            question.attempts.filter(
                                              (attempt) =>
                                                attempt.attemptOption ===
                                                answer.optionNumber
                                            ).length
                                          }
                                        </Text>
                                      </>
                                    </Tabs.Panel>
                                  ))}
                                </Tabs>
                              </Accordion.Panel>
                            </Accordion.Item>
                          ) : (
                            <Text key={question.questionId}>
                              Variation Type Questions
                            </Text>
                          )
                        )}
                    </Accordion>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            ) : (
              <Center mt={"xl"}>
                <>
                  <IconZoomQuestion size={20} stroke={1.5} color="gray" />
                  <Text px={"sm"}>No question from Topic attempted</Text>
                </>
              </Center>
            )}
          </Paper>
        ))}
      </Modal>
      <Container size="lg" py="xl">
        <Title
          order={2}
          className={classes.title}
          align="center"
          mt="md"
          mb="lg"
        >
          Courses Detailed Statistics
        </Title>

        {/* <Text
      color="dimmed"
      className={classes.description}
      align="center"
      mt="md"
      mb="lg"
    >
      Every once in a while, you’ll see a Golbat that’s missing some fangs.
      This happens when hunger drives it to try biting a Steel-type Pokémon.
    </Text> */}
        <Center>
          <SegmentedControl
            sx={(theme) => ({
              root: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.white,
                boxShadow: theme.shadows.md,
                border: `1px solid ${
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : theme.colors.gray[1]
                }`,
              },

              active: {
                backgroundImage: theme.fn.gradient({
                  from: "pink",
                  to: "orange",
                }),
              },

              control: {
                border: "0 !important",
              },

              labelActive: {
                color: `${theme.white} !important`,
              },
            })}
            size="md"
            radius="xl"
            data={[
              { value: "All Courses", label: "All Courses" },
              {
                value: "Foundational",
                label: "Foundational",
              },
              {
                value: "Intermediate",
                label: "Intermediate",
              },
              {
                value: "Advanced",
                label: "Advanced",
              },
            ]}
            value={sort}
            onChange={setSort}
          />
        </Center>
        <SimpleGrid
          cols={3}
          spacing="xl"
          mt={30}
          breakpoints={[{ maxWidth: "md", cols: 1 }]}
        >
          {filteredCourses.map((c) => (
            <Card
              key={c.courseSlug}
              shadow="md"
              radius="md"
              className={classes.card}
              p="xl"
            >
              {c.courseLevel === "Advanced" ? (
                <IconSquareNumber3 color="red" />
              ) : c.courseLevel === "Foundational" ? (
                <IconSquareNumber1 color="green" />
              ) : (
                <IconSquareNumber2 color="orange" />
              )}
              {/* <feature.icon size={50} stroke={2} color={theme.fn.primaryColor()} /> */}
              <Text
                size="lg"
                weight={500}
                className={classes.cardTitle}
                mt="md"
              >
                {c.courseName}
              </Text>
              <Text size="sm" color="dimmed" mt="sm" mb={70}>
                {c.courseDescription}
              </Text>
              <Button
                radius="xl"
                style={{ flex: 1 }}
                className={classes.action}
                onClick={() => {
                  setOpened(true);
                  setDetails(c);
                }}
              >
                Details
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
};

export default Courses;
