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
import DOMPurify from "dompurify";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  AttemptsInfoType,
  CoursesInfoType,
  useGetFetchQuery,
  UsersWithMasteriesAndAttemptsType,
} from "@/pages/admin";
import { AllQuestionsType, QuestionDataType } from "@/types/question-types";
import {
  Accordion,
  ActionIcon,
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
  TypographyStylesProvider,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { CourseMedia } from "@prisma/client";
import {
  IconApps,
  IconCheck,
  IconPhoto,
  IconPlus,
  IconPresentation,
  IconReportSearch,
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconUpload,
  IconUsers,
  IconVideo,
  IconX,
  IconZoomQuestion,
} from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import VariablesBox from "../editor/VariablesBox";
import Latex from "../Latex";

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
  users,
  attempts,
  questions,
}: {
  users: UsersWithMasteriesAndAttemptsType;
  attempts: AttemptsInfoType;
  questions: AllQuestionsType;
}) => {
  const { classes } = useStyles();
  const queryClient = useQueryClient();
  const theme = useMantineTheme();
  const data: string[] = [];

  const getCourses = useGetFetchQuery(["all-courses"]) as FetchData;
  const courses: CoursesInfoType[] = getCourses?.data;

  const [sort, setSort] = useState("All Courses");
  const [openedDetails, setOpenedDetails] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [details, setDetails] = useState<CoursesInfoType | null>();
  const [multiValue, setMultiValue] = useState<string[]>([]);
  details?.topics.map((topic) => {
    data.push(topic.topicName);
  });

  const thisCourse: CoursesInfoType | undefined = courses.find(
    (course) => course.courseSlug === details?.courseSlug
  );

  const [overviewMessage, setOverviewMessage] = useState(
    thisCourse?.courseDescription as string
  );
  const [slidesMessage, setSlidesMessage] = useState(
    (thisCourse?.courseMedia as CourseMedia[]) ?? []
  );
  const [videoMessage, setVideoMessage] = useState(thisCourse?.video as string);
  const [additionalMessage, setAdditionalMessage] = useState(
    thisCourse?.markdown as string
  );
  const [files, setFiles] = useState<FileWithPath[]>([]);

  useEffect(() => {
    setOverviewMessage(details?.courseDescription as string);
    setSlidesMessage((details?.courseMedia as CourseMedia[]) ?? []);
    setVideoMessage(details?.video as string);
    setAdditionalMessage(details?.markdown as string);
  }, [
    details?.courseDescription,
    details?.markdown,
    details?.courseMedia,
    details?.video,
  ]);

  console.log(questions);
  console.log(overviewMessage, slidesMessage, videoMessage, additionalMessage);
  let filteredCourses;
  {
    sort === "All Courses"
      ? (filteredCourses = courses)
      : (filteredCourses = courses.filter((c) => c.courseLevel === sort));
  }
  console.log(filteredCourses);

  const filteredTopics = details?.topics.filter((topic) =>
    multiValue.includes(topic.topicName)
  );

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
        slides: CourseMedia[];
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
      toast.success("Updated Successfully!");
    },
  });

  const handleFileUpload = async (files: FileWithPath[]): Promise<string[]> => {
    const uploadPromises = files?.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "course_slides_media");
      console.log(formData);
      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload",
          formData
        );
        const updatedSlidesMessage = [...slidesMessage];
        updatedSlidesMessage.push({
          publicId: res.data.public_id,
          courseSlug: details?.courseSlug as string,
          courseMediaURL: res.data.secure_url,
          mediaName: res.data.original_filename,
        });
        setSlidesMessage(updatedSlidesMessage);
        toast.success("Successfully Added!");
        return res.data.secure_url;
      } catch (error) {
        console.log(error);
        toast.error(error instanceof Error ? error.message : "Unknown Error");
        throw error;
      }
    });
    const uploadedUrls = await Promise.all(uploadPromises as Promise<string>[]);
    return uploadedUrls;
  };

  const handleDeleteFile = async (name: string) => {
    // Delete the record from slidesMessage state
    const updatedFiles = files?.filter((slide) => slide.name !== name);
    setFiles(updatedFiles);
    // Unsigned presets does not allow delete after 10 mins
    // try {
    //   const response = await axios.post(
    //     `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/delete_by_token`,
    //     {
    //       public_ids: [media.publicId],
    //       api_key: process.env.CLOUDINARY_API_KEY,
    //       api_secret: process.env.CLOUDINARY_SECRET,
    //     }
    //   );
    //   console.log(response.data);
    //   toast.success("Successfully Deleted!");
    // } catch (error) {
    //   console.log(error);
    //   toast.error(error instanceof Error ? error.message : "Unknown Error");
    //   // throw error;
    // }
  };

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
                                topic.topicSlug ===
                                user.questionWithAddedTime.question.topicSlug
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
                  <Accordion.Control
                    sx={(theme) => ({
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[7]
                          : theme.white,
                    })}
                  >
                    Display Questions
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Accordion>
                      {questions
                        .filter(
                          (question) =>
                            question.questionsWithAddedTime.some(
                              (q) => q.courseSlug === details?.courseSlug
                            ) && question.topicSlug === topic.topicSlug
                        )
                        .map((question, index) =>
                          question.variationId !== 0 ? (
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
                                    {
                                      question.questionsWithAddedTime.filter(
                                        (q) =>
                                          q.attempts.some(
                                            (a) =>
                                              a.courseSlug ===
                                              details?.courseSlug
                                          )
                                      ).length
                                    }
                                  </Text>
                                </Group>
                                <Text italic fw={500}>
                                  Correct % for This Question:{" "}
                                  {(question.questionsWithAddedTime.flatMap(
                                    (q) =>
                                      q.attempts.filter(
                                        (attempt) => attempt.isCorrect
                                      )
                                  ).length /
                                    question.questionsWithAddedTime.length) *
                                    100}
                                  %
                                </Text>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <div
                                  className="rawhtml rawhtml-lg-img"
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                      question.questionContent,
                                      {
                                        ADD_TAGS: ["iframe"],
                                        ADD_ATTR: [
                                          "allow",
                                          "allowfullscreen",
                                          "frameborder",
                                          "scrolling",
                                        ],
                                      }
                                    ),
                                  }}
                                />
                                <VariablesBox
                                  variables={
                                    (question.questionData as QuestionDataType)
                                      .variables
                                  }
                                />
                                <Tabs
                                  defaultValue={String(index)}
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
                                    {(
                                      question.questionData as QuestionDataType
                                    ).answers?.map((answer, index) => (
                                      <Tabs.Tab
                                        key={answer.key}
                                        value={index.toString()}
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
                                        Option {index}
                                      </Tabs.Tab>
                                    ))}
                                  </Tabs.List>
                                  {(
                                    question.questionData as QuestionDataType
                                  ).answers?.map((answer, index) => (
                                    <Tabs.Panel
                                      key={index}
                                      value={index.toString()}
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
                                            question.questionsWithAddedTime.filter(
                                              (q) =>
                                                q.attempts.some(
                                                  (a) =>
                                                    a.courseSlug ===
                                                    details?.courseSlug
                                                )
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
                                    Total Number of Attempts on This Variation
                                    of Question:{" "}
                                    {question.questionsWithAddedTime.length}
                                  </Text>
                                </Group>
                                <Text italic fw={500}>
                                  Correct % for This Question:{" "}
                                  {(question.questionsWithAddedTime.flatMap(
                                    (q) =>
                                      q.attempts.filter(
                                        (attempt) => attempt.isCorrect
                                      )
                                  ).length /
                                    question.questionsWithAddedTime.length) *
                                    100}
                                  %
                                </Text>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <div
                                  className="rawhtml rawhtml-lg-img"
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                      question.questionContent,
                                      {
                                        ADD_TAGS: ["iframe"],
                                        ADD_ATTR: [
                                          "allow",
                                          "allowfullscreen",
                                          "frameborder",
                                          "scrolling",
                                        ],
                                      }
                                    ),
                                  }}
                                />
                                <VariablesBox
                                  variables={
                                    (question.questionData as QuestionDataType)
                                      .variables
                                  }
                                />
                              </Accordion.Panel>
                            </Accordion.Item>
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
          setOverviewMessage(thisCourse?.courseDescription as string);
          setSlidesMessage(thisCourse?.courseMedia as CourseMedia[]);
          setVideoMessage(thisCourse?.video as string);
          setAdditionalMessage(thisCourse?.markdown as string);
        }}
        title={details?.courseName}
        size="70%"
      >
        <Center>
          <Text fw={500}>
            [Note]: Please use the Questions tab for question generation
          </Text>
        </Center>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFileUpload(files);
            editMutation.mutate({
              courseSlug: details?.courseSlug as string,
              content: {
                overview: overviewMessage,
                slides: slidesMessage,
                video: videoMessage,
                additional: additionalMessage,
              },
            });
            setOpenedEdit(false);
          }}
        >
          <>
            <Group m={10} pt={"md"}>
              <IconApps size={19} />
              <Title order={4}>Edit Overview</Title>
            </Group>
            <Editor
              upload_preset="course_overview_media"
              value={overviewMessage}
              onChange={setOverviewMessage}
            />
            <Box>
              <Group m={10} pt={"md"}>
                <IconPresentation size={19} />
                <Title order={4}>Edit Lecture Slides</Title>
                <Text italic>*PDF Files Only</Text>
              </Group>
            </Box>
            <Box>
              <>
                {files?.map((media) => {
                  return (
                    <Group key={media.name}>
                      <Text>{media.name}</Text>
                      <ActionIcon onClick={() => handleDeleteFile(media.name)}>
                        <IconX size={18} />
                      </ActionIcon>
                    </Group>
                  );
                })}
              </>
            </Box>
            <Dropzone
              onDrop={(files) => {
                setFiles((prevSelectedFiles) => [
                  ...prevSelectedFiles,
                  ...files,
                ]);
              }}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={10000000}
              accept={{ "application/pdf": [".pdf"] }}
            >
              <Group
                position="center"
                spacing="xl"
                style={{ minHeight: 220, pointerEvents: "none" }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    size={50}
                    stroke={1.5}
                    color={
                      theme.colors[theme.primaryColor]?.[
                        theme.colorScheme === "dark" ? 4 : 6
                      ]
                    }
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    size={50}
                    stroke={1.5}
                    color={
                      theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]
                    }
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={50} stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag images here or click to select files
                  </Text>
                  <Text size="sm" color="dimmed" inline mt={7}>
                    Attach as many files as you like, each file should not
                    exceed 5mb
                  </Text>
                </div>
              </Group>
            </Dropzone>
            <Group m={10} pt={"md"}>
              <IconVideo size={19} />
              <Title order={4}>Edit Lecture Video</Title>
            </Group>
            <Editor
              upload_preset="course_video_media"
              value={videoMessage}
              onChange={setVideoMessage}
            />
            <Group m={10} pt={"md"}>
              <IconReportSearch size={19} />
              <Title order={4}>Edit Additional Resources</Title>
            </Group>
            <Editor
              upload_preset="course_additional_media"
              value={additionalMessage}
              onChange={setAdditionalMessage}
            />
            <Group position="center" mt="xl">
              <Button type="submit" className={classes.controlModal}>
                Confirm Changes
              </Button>
              <Button
                className={classes.controlModal}
                onClick={() => {
                  setOpenedEdit(false);
                  setOverviewMessage(details?.courseDescription as string);
                  setSlidesMessage(details?.courseMedia as CourseMedia[]);
                  setVideoMessage(details?.video as string);
                  setAdditionalMessage(details?.markdown as string);
                }}
              >
                Cancel
              </Button>
            </Group>
          </>
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
                <IconSquareNumber3 className="stroke-red-500 dark:stroke-red-700" />
              ) : c.courseLevel === "Foundational" ? (
                <IconSquareNumber1 className="stroke-green-500 dark:stroke-green-700" />
              ) : (
                <IconSquareNumber2 className="stroke-yellow-500 dark:stroke-yellow-700" />
              )}
              <Text
                size="lg"
                weight={500}
                className={classes.cardTitle}
                mt="md"
              >
                {c.courseName}
              </Text>
              <TypographyStylesProvider
                sx={(theme) => ({
                  color: theme.colors.gray[6],
                  fontSize: theme.fontSizes.sm,
                })}
                mt="sm"
                mb={70}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(c.courseDescription, {
                      ADD_TAGS: ["iframe"],
                      ADD_ATTR: [
                        "allow",
                        "allowfullscreen",
                        "frameborder",
                        "scrolling",
                      ],
                    }),
                  }}
                />
              </TypographyStylesProvider>
              <Group className={classes.action}>
                <Button
                  radius="xl"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setOpenedEdit(true);
                    setDetails(c);
                  }}
                  className={classes.controlModal}
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
                  className={classes.controlModal}
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

  controlModal: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).background
        : theme.fn.variant({
            variant: "filled",
            color: theme.primaryColor,
          }).background,
    color:
      theme.colorScheme === "dark"
        ? theme.fn.variant({ variant: "light", color: theme.primaryColor })
            .color
        : theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .color,
  },

  image: {
    filter: theme.colorScheme === "dark" ? "invert(1)" : "none",
  },
}));
