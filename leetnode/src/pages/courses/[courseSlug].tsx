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
  ActionIcon,
  AppShell,
  Box,
  Button,
  Center,
  Container,
  createStyles,
  Divider,
  Flex,
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
import {
  useMediaQuery,
  useSessionStorage,
  useViewportSize,
} from "@mantine/hooks";
import { Course, CourseMedia, Mastery, Topic } from "@prisma/client";
import {
  IconApps,
  IconArrowBarLeft,
  IconArrowLeft,
  IconArrowRight,
  IconChartLine,
  IconChevronsLeft,
  IconChevronsRight,
  IconDownload,
  IconMessages,
  IconPresentation,
  IconReportSearch,
  IconTarget,
  IconVideo,
  IconZoomQuestion,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import { getCourseDetails } from "../api/course/[courseSlug]";

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
  const { width } = useViewportSize();

  // States
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [sidebarOpened, setSidebarOpened] = useState(false);
  useMemo(() => {
    if (mobile !== undefined) {
      setSidebarOpened(!mobile);
    }
  }, [mobile]);

  const [section, setSection] = useSessionStorage<"learn" | "practice">({
    key: "courseSectionTab",
    defaultValue: "learn",
  });
  const [active, setActive] = useSessionStorage({
    key: "courseActiveTab",
    defaultValue: "Overview",
  });

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
      axios.get<CourseInfoType>(`/api/course/${currentCourseSlug}`),
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
            mobile && setSidebarOpened(false);
          }}
        >
          <item.icon className={classes.linkIcon} stroke={1.5} />
          <span>{item.label}</span>
        </a>
      )
  );

  // TODO: Fix these nasty regex hacks (and in other places as well)
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
              <Divider my="sm" variant="dotted" />
              <a
                className={cx(classes.link, {
                  [classes.linkActive]: "Course Discussion" === active,
                })}
                onClick={(event: { preventDefault: () => void }) => {
                  event.preventDefault();
                  setActive("Course Discussion");
                  mobile && setSidebarOpened(false);
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
      <ScrollArea>
        {active === "Overview" ? (
          <Container>
            <Title mb="lg">{courseDetails.courseName}</Title>
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
              <Flex align="center" gap="md">
                <Title order={3}>{media.mediaName}</Title>
                <Tooltip label="Download Slides" withArrow>
                  <ActionIcon
                    variant="default"
                    className="rounded-full p-1"
                    onClick={() => {
                      window.open(media.courseMediaURL);
                    }}
                  >
                    <IconDownload size={16} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
              <Document
                file={media.courseMediaURL}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page
                  pageNumber={pageNumber}
                  width={
                    sidebarOpened
                      ? width > theme.breakpoints.lg
                        ? (width - 300) * 0.5
                        : (width - 200) * 0.8
                      : width * 0.9
                  }
                />
              </Document>
              <Flex gap={mobile ? "xs" : "md"}>
                <Button
                  onClick={() => {
                    if (pageNumber > 1) {
                      setPageNumber(pageNumber - 1);
                    }
                    setPageNumber(1);
                  }}
                  variant="light"
                  size={mobile ? "xs" : "md"}
                >
                  <IconChevronsLeft size={mobile ? 16 : 20} stroke={1.5} />
                </Button>
                <Button
                  onClick={() => {
                    if (pageNumber > 1) {
                      setPageNumber(pageNumber - 1);
                    }
                  }}
                  variant="light"
                  size={mobile ? "xs" : "md"}
                >
                  <IconArrowLeft size={mobile ? 16 : 20} stroke={1.5} />
                </Button>
                <Tooltip label="Jump to Page 1" withArrow position="bottom">
                  <Button
                    variant="light"
                    onClick={() => setPageNumber(1)}
                    size={mobile ? "xs" : "md"}
                    fz={mobile ? "xs" : "sm"}
                  >
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
                  size={mobile ? "xs" : "md"}
                >
                  <IconArrowRight size={mobile ? 16 : 20} stroke={1.5} />
                </Button>
                <Button
                  onClick={() => {
                    if (pageNumber < numPages) {
                      setPageNumber(pageNumber + 1);
                    }
                    setPageNumber(numPages);
                  }}
                  variant="light"
                  size={mobile ? "xs" : "md"}
                >
                  <IconChevronsRight size={mobile ? 16 : 20} stroke={1.5} />
                </Button>
              </Flex>
            </Stack>
          ))
        ) : active === "Lecture Videos" ? (
          <Box className="h-[calc(100vh-180px)]" w="100%" h="100%">
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
          </Box>
        ) : active === "Additional Resources" ? (
          <Box className="h-[calc(100vh-180px)]" w="100%" h="100%">
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
          </Box>
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
      </ScrollArea>
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
  };
});
