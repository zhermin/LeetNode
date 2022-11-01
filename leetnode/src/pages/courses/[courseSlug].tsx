import {
  Course,
  Answer,
  Attempt,
  Question,
  QuestionMedia,
  QuestionWithAddedTime,
  Topic,
  UserCourseQuestion,
  Mastery,
} from "@prisma/client";
import { prisma } from "@/server/db/client";

import axios, { AxiosError } from "axios";
import { useState } from "react";
import { getSession, GetSessionParams, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  dehydrate,
  QueryCache,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import LeetNodeHeader from "@/components/Header";
import LeetNodeNavbar from "@/components/Navbar";
import LeetNodeFooter from "@/components/Footer";
import PracticeQuestion from "@/components/course/PracticeQuestion";
import ResultsPage from "@/components/course/ResultsPage";
import CourseDiscussion from "@/components/course/CourseDiscussion";
import QuestionHistory from "@/components/course/QuestionHistory";
import MarkdownLatex from "@/components/MarkdownLatex";
import { Document, Page } from "react-pdf";

import {
  createStyles,
  AppShell,
  Header,
  Navbar as Sidebar,
  SegmentedControl,
  ScrollArea,
  Box,
  Container,
  Burger,
  MediaQuery,
  Text,
  Center,
  Loader,
  Button,
  Tooltip,
  Group,
  Stack,
  Title,
} from "@mantine/core";
import {
  IconApps,
  IconPresentation,
  IconVideo,
  IconReportSearch,
  IconMessages,
  IconZoomQuestion,
  IconClipboardCheck,
  IconArrowBarLeft,
  IconArrowLeft,
  IconArrowRight,
  IconChartLine,
} from "@tabler/icons";

type CourseInfoType =
  | (Course & {
      topics: (Topic & {
        mastery: Mastery[];
      })[];
      userCourseQuestions: UserCourseQuestion &
        {
          questionsWithAddedTime: (QuestionWithAddedTime & {
            question: Question & {
              answers: Answer[];
              attempts: Attempt[];
              topic: Topic;
              questionMedia: QuestionMedia[];
            };
          })[];
        }[];
    })
  | null;

const fetchCourse: (
  courseSlug: string
) => Promise<CourseInfoType | null> = async (courseSlug) => {
  try {
    const { data } = await axios.get(`/api/courses/${courseSlug}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      signIn("google");
    }
    console.log(error);
    throw error;
  }
};

export default function CourseMainPage() {
  // Mantine
  const { theme, classes, cx } = useStyles();

  // States
  const [opened, setOpened] = useState(false);
  const [section, setSection] = useState<"learn" | "practice">("learn");
  const [active, setActive] = useState("Overview");
  const [endReached, setEndReached] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    { currentQuestion: number; answerByUser: string }[]
  >([]);
  const [attempt, setAttempt] = useState<
    { currentQuestion: number; isCorrect: number }[]
  >([]);
  const [questionHistory, setQuestionHistory] = useState<
    {
      questionContent: string;
      questionNumber: number;
      questionMedia: string;
      topicName: string;
      questionDifficulty: string;
      isCorrect: number;
      answerContent: string;
    }[]
  >([]);

  // Data Fetched using Axios, Queried by React Query
  const router = useRouter();
  const {
    data: course,
    isLoading,
    isFetching,
    isError,
  } = useQuery<CourseInfoType | null>(["course", router.query.courseSlug], () =>
    fetchCourse(router.query.courseSlug as string)
  );

  if (isLoading || isFetching || !course)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isError) return <div>Something went wrong!</div>;

  // Sidebar Tabs based on Fetched Data
  const tabs = {
    learn: [
      { label: "Overview", icon: IconApps },
      course.slide ? { label: "Lecture Slides", icon: IconPresentation } : null,
      course.video ? { label: "Lecture Videos", icon: IconVideo } : null,
      { label: "Additional Resources", icon: IconReportSearch },
      { label: "Course Discussion", icon: IconMessages },
    ],
    practice: [
      { label: "Question", icon: IconZoomQuestion },
      { label: "Attempts", icon: IconChartLine },
      { label: "Mastery", icon: IconClipboardCheck },
      { label: "Discussion", icon: IconMessages },
    ],
  };

  const links = tabs[section].map(
    (item) =>
      item && (
        <a
          className={cx(classes.link, {
            [classes.linkActive]: item.label === active,
          })}
          key={item.label}
          onClick={(event: { preventDefault: () => void }) => {
            event.preventDefault();
            setActive(item.label);
          }}
        >
          <item.icon className={classes.linkIcon} stroke={1.5} />
          <span>{item.label}</span>
        </a>
      )
  );

  return (
    <AppShell
      className={classes.appshell}
      navbarOffsetBreakpoint="sm"
      header={
        <>
          <LeetNodeHeader title={course.courseName} />
          <Header height={80}>
            <Container
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((opened) => !opened)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
              <LeetNodeNavbar />
            </Container>
          </Header>
        </>
      }
      footer={<LeetNodeFooter />}
      navbar={
        <Sidebar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
          className={classes.navbar}
        >
          <Sidebar.Section>
            <Text weight={600} size="lg" align="center" mb="lg">
              {course.courseName}
            </Text>

            <SegmentedControl
              value={section}
              onChange={(value: "learn" | "practice") => setSection(value)}
              transitionTimingFunction="ease"
              fullWidth
              data={[
                { label: "Learn", value: "learn" },
                { label: "Practice", value: "practice" },
              ]}
            />
          </Sidebar.Section>

          <Sidebar.Section mt="xl" grow>
            {links}
          </Sidebar.Section>

          <Sidebar.Section className={classes.sidebarFooter}>
            <Link href="/courses" passHref>
              <Box className={classes.link} component="a">
                <IconArrowBarLeft className={classes.linkIcon} stroke={1.5} />
                <span>Back to Courses</span>
              </Box>
            </Link>
          </Sidebar.Section>
        </Sidebar>
      }
    >
      <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
        {active === "Overview" ? (
          <Container>
            <Title>{course.courseName}</Title>
            <Text size="xl">{course.courseDescription}</Text>
          </Container>
        ) : active === "Lecture Slides" ? (
          <Stack align="center">
            <Document file={course.slide} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
            <Group>
              <Button
                onClick={() => {
                  if (pageNumber > 1) {
                    setPageNumber(pageNumber - 1);
                  }
                }}
                variant="light"
              >
                <IconArrowLeft stroke={1.5} />
              </Button>
              <Tooltip label="Jump to Page 1" withArrow position="bottom">
                <Button variant="light" onClick={() => setPageNumber(1)}>
                  Page {pageNumber} of {numPages}
                </Button>
              </Tooltip>
              <Button
                onClick={() => {
                  if (pageNumber < numPages) {
                    setPageNumber(pageNumber + 1);
                  }
                }}
                variant="light"
              >
                <IconArrowRight stroke={1.5} />
              </Button>
            </Group>
          </Stack>
        ) : active === "Lecture Videos" ? (
          <Group className="h-[calc(100vh-180px)]">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${course.video}?rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Group>
        ) : active === "Additional Resources" ? (
          <MarkdownLatex>{course.markdown ?? defaultMarkdown}</MarkdownLatex>
        ) : active === "Course Discussion" ? (
          <CourseDiscussion />
        ) : active === "Question" ? (
          <PracticeQuestion
            questionDisplay={
              course.userCourseQuestions[0]?.questionsWithAddedTime
            }
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            attempt={attempt}
            setAttempt={setAttempt}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            questionHistory={questionHistory}
            setQuestionHistory={setQuestionHistory}
            endReached={endReached}
            setEndReached={setEndReached}
          />
        ) : active === "Attempts" ? (
          <QuestionHistory
            questionHistory={questionHistory}
            questionDisplay={
              course.userCourseQuestions[0]?.questionsWithAddedTime
            }
          />
        ) : active === "Mastery" ? (
          <ResultsPage
            questionDisplay={
              course.userCourseQuestions[0]?.questionsWithAddedTime
            }
            attempt={attempt}
          />
        ) : active === "Discussion" ? (
          <div>Discussion</div>
        ) : (
          <div>Error</div>
        )}
      </ScrollArea.Autosize>
    </AppShell>
  );
}

export async function getStaticPaths() {
  const courses: Course[] = await prisma.course.findMany();

  const paths = courses.map((course) => ({
    params: { courseSlug: course.courseSlug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(
  context: GetSessionParams & { params: { courseSlug: string } }
) {
  const session = await getSession(context);
  if (!session) signIn("google");

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Something went wrong: ${error.message}`);
        }
      },
    }),
  });
  await queryClient.prefetchQuery<CourseInfoType | null>(
    ["course", context.params.courseSlug],
    () => fetchCourse(context.params.courseSlug)
  );

  console.log("[PREFETCHED COURSE]");

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");

  return {
    appshell: {
      main: {
        background:
          theme.colorScheme === "dark"
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
      },
    },

    navbar: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,
      cursor: "pointer",

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
        },
      },
    },

    sidebarFooter: {
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
      paddingTop: theme.spacing.md,
    },
  };
});

const defaultMarkdown = `# Additional Learning Resources by [Khan Academy](https://www.khanacademy.org/)
            
<div classname="flex h-[calc(100vh-260px)]"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/videoseries?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
