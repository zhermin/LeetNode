import axios from "axios";
import DOMPurify from "dompurify";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { Document, Page } from "react-pdf";

import CourseDiscussion from "@/components/course/CourseDiscussion";
import PracticeQuestion from "@/components/course/PracticeQuestion";
import QuestionHistory from "@/components/course/QuestionHistory";
import ResultsPage from "@/components/course/ResultsPage";
import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import Latex from "@/components/Latex";
import LeetNodeNavbar from "@/components/Navbar";
import { prisma } from "@/server/db/client";
import {
  AppShell,
  Box,
  Button,
  Center,
  Container,
  createStyles,
  Group,
  Header,
  Loader,
  Navbar as Sidebar,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
  TypographyStylesProvider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Course, CourseMedia, Mastery, Topic } from "@prisma/client";
import {
  IconApps,
  IconArrowBarLeft,
  IconArrowLeft,
  IconArrowRight,
  IconChartLine,
  IconChevronsLeft,
  IconChevronsRight,
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
} | null;

export type UserQuestionWithAttemptsType = {
  topics: (Topic & {
    mastery: Mastery[];
  })[];
} | null;

export default function CourseMainPage({
  courseDetails,
}: {
  courseDetails: Course & { courseMedia: CourseMedia[] };
}) {
  // Mantine
  const { theme, classes, cx } = useStyles();

  // States
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [sidebarOpened, setSidebarOpened] = useState(!mobile);
  useMemo(() => setSidebarOpened(!mobile), [mobile]);

  const [section, setSection] = useState<"learn" | "practice">("learn");
  const [active, setActive] = useState("Overview");

  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Data Fetched using Axios, Queried by React Query
  const router = useRouter();
  const currentCourseSlug = router.query.courseSlug;

  const { data: course } = useQuery({
    queryKey: ["course", currentCourseSlug],
    queryFn: () =>
      axios.get<CourseInfoType>(`/api/courses/${currentCourseSlug}`),
  });

  if (!course) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Loader />
      </Center>
    );
  }

  // Sidebar Tabs based on Fetched Data
  const tabs = {
    learn: [
      { label: "Overview", icon: IconApps },
      courseDetails.courseMedia.length > 0
        ? { label: "Lecture Slides", icon: IconPresentation }
        : null,
      courseDetails.video ? { label: "Lecture Videos", icon: IconVideo } : null,
      courseDetails.markdown
        ? { label: "Additional Resources", icon: IconReportSearch }
        : null,
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

  // Check if courseDetails.video/courseDetails.markdown contains an iframe tag
  const hasIframeVideo = /<iframe.*?>/.test(courseDetails.video as string);

  // If it does, add the width and height attributes to the iframe tag
  const modifiedVideo = hasIframeVideo
    ? courseDetails.video?.replace(
        /<iframe(.*?)>/g,
        '<iframe$1 width="100%" height="100%">'
      )
    : courseDetails.video;

  const parts = courseDetails.markdown?.split(/(<iframe.*?>.*?<\/iframe>)/g);

  const output = parts?.map((part) => {
    if (part.match(/<iframe.*?>.*?<\/iframe>/)) {
      const iframe = part
        .replace(/(width=".*?")|(height=".*?")/g, "")
        .replace(/<iframe/, '<iframe width="100%" height="100%"');
      return { type: "video", string: iframe };
    } else {
      return { type: "markdown", string: part };
    }
  });

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
              <LeetNodeNavbar
                sidebarOpened={sidebarOpened}
                setSidebarOpened={setSidebarOpened}
              />
            </Container>
          </Header>
        </>
      }
      footer={<LeetNodeFooter />}
      navbar={
        sidebarOpened ? (
          <Sidebar
            p="md"
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
              <a
                className={cx(classes.link, {
                  [classes.linkActive]: "Course Discussion" === active,
                })}
                onClick={(event: { preventDefault: () => void }) => {
                  event.preventDefault();
                  setActive("Course Discussion");
                }}
              >
                <IconMessages className={classes.linkIcon} stroke={1.5} />
                <span>Discussion</span>
              </a>
              <Link href="/courses" passHref>
                <Box className={classes.link}>
                  <IconArrowBarLeft className={classes.linkIcon} stroke={1.5} />
                  <span>Back to Courses</span>
                </Box>
              </Link>
            </Sidebar.Section>
          </Sidebar>
        ) : (
          <></>
        )
      }
    >
      <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
        {active === "Overview" ? (
          <Container>
            <Title>{courseDetails.courseName}</Title>
            <TypographyStylesProvider
              sx={(theme) => ({
                fontSize: theme.fontSizes.xl,
              })}
            >
              <div
                style={{ width: "100%", height: "100%" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(courseDetails.courseDescription, {
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
          </Container>
        ) : active === "Lecture Slides" ? (
          courseDetails.courseMedia.map((media) => (
            <Stack align="center" key={media.publicId}>
              <Title my={"md"}>{media.mediaName}</Title>
              <Document
                file={media.courseMediaURL}
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
                    setPageNumber(1);
                  }}
                  variant="light"
                >
                  <IconChevronsLeft stroke={1.5} />
                </Button>
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
                <Button
                  onClick={() => {
                    if (pageNumber < numPages) {
                      setPageNumber(pageNumber + 1);
                    }
                    setPageNumber(numPages);
                  }}
                  variant="light"
                >
                  <IconChevronsRight stroke={1.5} />
                </Button>
              </Group>
            </Stack>
          ))
        ) : active === "Lecture Videos" ? (
          <Group className="h-[calc(100vh-180px)]" w="100%" h="100%">
            <div
              style={{ width: "100%", height: "100%" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(modifiedVideo as string, {
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
          </Group>
        ) : active === "Additional Resources" ? (
          <Group className="h-[calc(100vh-180px)]" w="100%" h="100%">
            {output?.map((resource) =>
              resource.type === "video" ? (
                <div
                  key={resource.string}
                  style={{ width: "100%", height: "100%" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(resource.string as string, {
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
              ) : (
                <Latex
                  key={resource.string}
                  style={{ width: "100%", height: "100%" }}
                >
                  {resource.string}
                </Latex>
              )
            )}
          </Group>
        ) : active === "Course Discussion" ? (
          <CourseDiscussion courseName={courseDetails.courseName} />
        ) : active === "Question" ? (
          <PracticeQuestion />
        ) : active === "Attempts" ? (
          <QuestionHistory courseSlug={courseDetails.courseSlug} />
        ) : active === "Mastery" ? (
          <ResultsPage />
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
      paddingTop: theme.spacing.sm,
    },
  };
});
