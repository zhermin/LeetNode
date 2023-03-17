import axios from "axios";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Document, Page } from "react-pdf";

import CourseDiscussion from "@/components/course/CourseDiscussion";
import PracticeQuestion from "@/components/course/PracticeQuestion";
import QuestionHistory from "@/components/course/QuestionHistory";
import ResultsPage from "@/components/course/ResultsPage";
import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import MarkdownLatex from "@/components/MarkdownLatex";
import LeetNodeNavbar from "@/components/Navbar";
import { prisma } from "@/server/db/client";
import {
  AppShell,
  Box,
  Burger,
  Button,
  Center,
  Container,
  createStyles,
  Group,
  Header,
  Loader,
  MediaQuery,
  Navbar as Sidebar,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  Answer,
  Attempt,
  Course,
  Mastery,
  Question,
  QuestionMedia,
  QuestionWithAddedTime,
  Topic,
  UserCourseQuestion,
} from "@prisma/client";
import {
  IconApps,
  IconArrowBarLeft,
  IconArrowLeft,
  IconArrowRight,
  IconChartLine,
  IconMessages,
  IconPresentation,
  IconReportSearch,
  IconTarget,
  IconVideo,
  IconZoomQuestion,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import { getCourseDetails } from "../api/courses/[courseSlug]";

export type CourseInfoType = {
  topics: (Topic & {
    mastery: Mastery[];
  })[];
  userCourseQuestions: (UserCourseQuestion & {
    questionsWithAddedTime: UserQuestionWithAttemptsType;
  })[];
} | null;

export type UserQuestionWithAttemptsType =
  | (QuestionWithAddedTime & {
      question: Question & {
        answers: Answer[];
        attempts: Attempt[];
        topic: Topic;
        questionMedia: QuestionMedia[];
      };
    })[]
  | undefined;

export default function CourseMainPage({
  courseDetails,
}: {
  courseDetails: Course;
}) {
  // Mantine
  const { theme, classes, cx } = useStyles();

  // States
  const [opened, setOpened] = useState(false);
  const [section, setSection] = useState<"learn" | "practice">("learn");
  const [active, setActive] = useState("Overview");

  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Data Fetched using Axios, Queried by React Query
  const router = useRouter();

  const { data: course } = useQuery<CourseInfoType>(
    ["course", router.query.courseSlug],
    async () => {
      try {
        const { data } = await axios.get(
          `/api/courses/${router.query.courseSlug}`
        );
        return data;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch user course info from API");
      }
    },
    { useErrorBoundary: true }
  );

  if (!course) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Loader />
      </Center>
    );
  }

  console.log(course);

  // Sidebar Tabs based on Fetched Data
  const tabs = {
    learn: [
      { label: "Overview", icon: IconApps },
      courseDetails.slide
        ? { label: "Lecture Slides", icon: IconPresentation }
        : null,
      courseDetails.video ? { label: "Lecture Videos", icon: IconVideo } : null,
      { label: "Additional Resources", icon: IconReportSearch },
      // { label: "Course Discussion", icon: IconMessages },
    ],
    practice: [
      { label: "Question", icon: IconZoomQuestion },
      { label: "Attempts", icon: IconChartLine },
      { label: "Mastery", icon: IconTarget },
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
          <LeetNodeHeader title={courseDetails.courseName} />
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
              {courseDetails.courseName}
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
            <Box className={classes.link} mb="sm">
              <IconMessages className={classes.linkIcon} stroke={1.5} />
              <span>Course Discussion</span>
            </Box>
            <Link href="/courses" passHref>
              <Box className={classes.link}>
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
            <Title>{courseDetails.courseName}</Title>
            <Text size="xl">{courseDetails.courseDescription}</Text>
          </Container>
        ) : active === "Lecture Slides" ? (
          <Stack align="center">
            <Document
              file={courseDetails.slide}
              onLoadSuccess={onDocumentLoadSuccess}
            >
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
              src={`https://www.youtube.com/embed/${courseDetails.video}?rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Group>
        ) : active === "Additional Resources" ? (
          <MarkdownLatex>
            {courseDetails.markdown ?? defaultMarkdown}
          </MarkdownLatex>
        ) : active === "Course Discussion" ? (
          <CourseDiscussion courseName={courseDetails.courseName} />
        ) : active === "Question" ? (
          <PracticeQuestion
            questionDisplay={
              course.userCourseQuestions[0]?.questionsWithAddedTime
            }
            courseSlug={courseDetails.courseSlug}
          />
        ) : active === "Attempts" ? (
          <QuestionHistory courseSlug={courseDetails.courseSlug} />
        ) : active === "Mastery" ? (
          <ResultsPage course={course} />
        ) : active === "Discussion" ? (
          <div>Discussion (WIP)</div>
        ) : (
          <Text>Error</Text>
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

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;

  const courseDetails = await getCourseDetails(params?.courseSlug as string);

  console.log(
    typeof courseDetails === "object"
      ? `PRERENDERED /${params?.courseSlug} DETAILS`
      : "FAILED TO PRERENDER"
  );

  return {
    props: {
      courseDetails,
    },
  };
};

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

<div className="flex h-[calc(100vh-260px)]"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/videoseries?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
