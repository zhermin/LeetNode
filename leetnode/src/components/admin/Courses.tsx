import axios, { AxiosError } from "axios";
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
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import Latex from "react-latex-next";

import {
  AttemptsInfoType,
  CoursesInfoType,
  QuestionsInfoType,
  useGetFetchQuery,
  UsersWithMasteriesAndAttemptsType,
} from "@/pages/admin";
import {
  Accordion,
  Box,
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
  IconApps,
  IconCheck,
  IconPlus,
  IconPresentation,
  IconReportSearch,
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconUsers,
  IconVideo,
  IconX,
  IconZoomQuestion,
} from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const Editor = dynamic(import("@/components/editor/CustomRichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

interface FetchData {
  data: CoursesInfoType[];
}

const Courses = ({
  // courses,
  users,
  attempts,
  questions,
}: {
  // courses: CoursesInfoType[];
  users: UsersWithMasteriesAndAttemptsType;
  attempts: AttemptsInfoType;
  questions: QuestionsInfoType;
}) => {
  const { classes } = useStyles();
  const queryClient = useQueryClient();

  const getCourses = useGetFetchQuery(["all-courses"]) as FetchData;
  const courses: CoursesInfoType[] = getCourses?.data;

  const [sort, setSort] = useState("All Courses");
  const [openedDetails, setOpenedDetails] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [details, setDetails] = useState<CoursesInfoType | null>();
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [editValue, setEditValue] = useState("overview");
  const [message, setMessage] = useState<{
    overview: string;
    slides: string;
    video: string;
    additional: string;
  }>({ overview: "", slides: "", video: "", additional: "" });
  // const [overviewMessage, setOverviewMessage] = useState("");
  // const [slidesMessage, setSlidesMessage] = useState("");
  // const [videoMessage, setVideoMessage] = useState("");
  // const [additionalMessage, setAdditionalMessage] = useState("");

  console.log(message);
  // console.log(overviewMessage, slidesMessage, videoMessage, additionalMessage);
  let filteredCourses;
  {
    sort === "All Courses"
      ? (filteredCourses = courses)
      : (filteredCourses = courses.filter((c) => c.courseLevel === sort));
  }
  console.log(filteredCourses);
  const data: string[] = [];

  details?.topics.map((topic) => {
    data.push(topic.topicName);
  });

  useEffect(() => {
    if (details !== undefined && details !== null) {
      setMessage({
        overview: JSON.parse(JSON.stringify(details?.learnTabJson)).overview,
        slides: JSON.parse(JSON.stringify(details?.learnTabJson)).slides,
        video: JSON.parse(JSON.stringify(details?.learnTabJson)).video,
        additional: JSON.parse(JSON.stringify(details?.learnTabJson))
          .additional,
      });
      // setOverviewMessage(
      //   JSON.parse(JSON.stringify(details?.learnTabJson)).overview
      // );
      // setSlidesMessage(
      //   JSON.parse(JSON.stringify(details?.learnTabJson)).slides
      // );
      // setVideoMessage(JSON.parse(JSON.stringify(details?.learnTabJson)).video);
      // setAdditionalMessage(
      //   JSON.parse(JSON.stringify(details?.learnTabJson)).additional
      // );
    }
  }, [details]);

  const filteredTopics = details?.topics.filter((topic) =>
    multiValue.includes(topic.topicName)
  );

  console.log(editValue);

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

  const editMutation = useMutation<
    Response,
    AxiosError,
    {
      courseSlug: string;
      content: {
        overview: string;
        slides: string;
        video: string;
        additional: string;
      };
    },
    () => void
  >({
    mutationFn: async (editCourse) => {
      console.log(editCourse);
      const res = await axios.post("/api/courses/editCourse", editCourse);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-courses"]);
      // queryClient.invalidateQueries(["post-comments"]);
      // setMessage("");
    },
  });

  return (
    <>
      <Modal
        opened={openedDetails}
        onClose={() => setOpenedDetails(false)}
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
                          question.variationId === 1 ? (
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

      <Modal
        opened={openedEdit}
        onClose={() => {
          setOpenedEdit(false);
          setMessage({
            overview: JSON.parse(JSON.stringify(details?.learnTabJson))
              .overview,
            slides: JSON.parse(JSON.stringify(details?.learnTabJson)).slides,
            video: JSON.parse(JSON.stringify(details?.learnTabJson)).video,
            additional: JSON.parse(JSON.stringify(details?.learnTabJson))
              .additional,
          });
        }}
        title={details?.courseName}
        size="70%"
      >
        <Center>
          <Text fw={500}>
            [Note]: Please use the Questions tab for question generation
          </Text>
        </Center>
        <Center>
          <SegmentedControl
            value={editValue}
            onChange={setEditValue}
            my={"xl"}
            radius={20}
            data={[
              {
                value: "overview",
                label: (
                  <Center>
                    <IconApps size={16} />
                    <Box ml={10}>Overview</Box>
                  </Center>
                ),
              },
              {
                value: "slides",
                label: (
                  <Center>
                    <IconPresentation size={16} />
                    <Box ml={10}>Lecture Slides</Box>
                  </Center>
                ),
              },
              {
                value: "videos",
                label: (
                  <Center>
                    <IconVideo size={16} />
                    <Box ml={10}>Lecture Videos</Box>
                  </Center>
                ),
              },
              {
                value: "additional",
                label: (
                  <Center>
                    <IconReportSearch size={16} />
                    <Box ml={10}>Additional Resources</Box>
                  </Center>
                ),
              },
            ]}
          />
        </Center>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editMutation.mutate({
              courseSlug: details?.courseSlug as string,
              content: message,
            });
            setOpenedEdit(false);
          }}
        >
          {editValue === "overview" ? (
            <Editor
              upload_preset="forum_media"
              value={message.overview}
              onChange={(newValue) =>
                setMessage((prevState) => ({
                  ...prevState,
                  overview: newValue,
                }))
              }
            />
          ) : editValue === "slides" ? (
            <Editor
              upload_preset="forum_media"
              value={message.slides}
              onChange={(newValue) =>
                setMessage((prevState) => ({
                  ...prevState,
                  slides: newValue,
                }))
              }
            />
          ) : editValue === "videos" ? (
            <Editor
              upload_preset="forum_media"
              value={message.video}
              onChange={(newValue) =>
                setMessage((prevState) => ({
                  ...prevState,
                  video: newValue,
                }))
              }
            />
          ) : (
            <Editor
              upload_preset="forum_media"
              value={message.additional}
              onChange={(newValue) =>
                setMessage((prevState) => ({
                  ...prevState,
                  additional: newValue,
                }))
              }
            />
          )}

          <Group position="center" mt="xl">
            <Button type="submit">Confirm Changes</Button>
            <Button
              onClick={() => {
                setOpenedEdit(false);
                setMessage({
                  overview: JSON.parse(JSON.stringify(details?.learnTabJson))
                    .overview,
                  slides: JSON.parse(JSON.stringify(details?.learnTabJson))
                    .slides,
                  video: JSON.parse(JSON.stringify(details?.learnTabJson))
                    .video,
                  additional: JSON.parse(JSON.stringify(details?.learnTabJson))
                    .additional,
                });
              }}
            >
              Cancel
            </Button>
          </Group>
        </form>
      </Modal>
      <Container size="lg" py="xl">
        <Title order={2} align="center" mb="lg" className={classes.title}>
          Courses Details
        </Title>
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
              <Group className={classes.action}>
                <Button
                  radius="xl"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setOpenedEdit(true);
                    setDetails(c);
                  }}
                >
                  Edit
                </Button>
                <Button
                  radius="xl"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setOpenedDetails(true);
                    setDetails(c);
                  }}
                >
                  Details
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
};

export default Courses;

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
