import {
  Course,
  Answer,
  Attempt,
  Question,
  QuestionMedia,
  QuestionWithAddedTime,
  Topic,
  UserCourseQuestion,
  User,
  Mastery,
} from "@prisma/client";
import { prisma } from "@/server/db/client";

import axios from "axios";
import { useState } from "react";
import { getSession, GetSessionParams } from "next-auth/react";
import Link from "next/link";

import LeetNodeHeader from "@/components/Header";
import LeetNodeNavbar from "@/components/Navbar";
import LeetNodeFooter from "@/components/Footer";
import PracticeQuestion from "@/components/course/PracticeQuestion";
import ResultsPage from "@/components/course/ResultsPage";
import AdditionalResources from "@/components/course/AdditionalResources";
import CourseDiscussion from "@/components/course/CourseDiscussion";
import CourseOverview from "@/components/course/CourseOverview";
import LectureSlides from "@/components/course/LectureSlides";
import LectureVideos from "@/components/course/LectureVideos";

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
} from "@tabler/icons";

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

type allQuestionsType = (UserCourseQuestion & {
  questionsWithAddedTime: (QuestionWithAddedTime & {
    question: Question & {
      attempts: Attempt[];
      topic: Topic;
      questionMedia: QuestionMedia[];
      answers: Answer[];
    };
  })[];
})[];

export default function CourseMainPage({
  questionDisplay,
  user,
  courseName,
}: {
  questionDisplay: allQuestionsType;
  user: User[];
  courseName: string;
  masteryLevel: Mastery[];
}) {
  const [opened, setOpened] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    { currentQuestion: number; answerByUser: string }[]
  >([]);
  const [attempt, setAttempt] = useState<
    { currentQuestion: number; isCorrect: number }[]
  >([]);
  const [questionHistory, setQuestionHistory] = useState<
    {
      questionId: number;
      topicName: string;
      questionDifficulty: string;
      isCorrect: number;
    }[]
  >([]);

  const { theme, classes, cx } = useStyles();
  const [section, setSection] = useState<"learn" | "practice">("learn");
  const [active, setActive] = useState("Overview");

  const tabs = {
    learn: [
      { label: "Overview", icon: IconApps },
      { label: "Lecture Slides", icon: IconPresentation },
      { label: "Lecture Videos", icon: IconVideo },
      { label: "Additional Resources", icon: IconReportSearch },
      { label: "Course Discussion", icon: IconMessages },
    ],
    practice: [
      { label: "Question", icon: IconZoomQuestion },
      { label: "Attempts", icon: IconClipboardCheck },
      { label: "Discussion", icon: IconMessages },
    ],
  };

  const links = tabs[section].map((item) => (
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
  ));

  return (
    <AppShell
      className={classes.appshell}
      navbarOffsetBreakpoint="sm"
      header={
        <>
          <LeetNodeHeader title={courseName} />
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
              {courseName}
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
          <CourseOverview />
        ) : active === "Lecture Slides" ? (
          <LectureSlides />
        ) : active === "Lecture Videos" ? (
          <LectureVideos />
        ) : active === "Additional Resources" ? (
          <AdditionalResources />
        ) : active === "Course Discussion" ? (
          <CourseDiscussion />
        ) : active === "Question" ? (
          <PracticeQuestion
            questionDisplay={questionDisplay}
            user={user}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            attempt={attempt}
            setAttempt={setAttempt}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            questionHistory={questionHistory}
            setQuestionHistory={setQuestionHistory}
          />
        ) : active === "Attempts" ? (
          <ResultsPage
            questionDisplay={questionDisplay}
            attempt={attempt}
            user={user}
          />
        ) : active === "Discussion" ? (
          <div>Discussion</div>
        ) : (
          <div>error</div>
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

  const displayData = async (request: { courseSlug: string }) => {
    try {
      console.log(request);
      const res = await axios.post(
        "http://localhost:3000/api/question/questions",
        request
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  const display = await displayData(context.params);
  const questionDisplay = display[0].questionsWithAddedTime;
  console.log(questionDisplay);
  const course = await prisma.course.findUnique({
    where: {
      courseSlug: context.params.courseSlug,
    },
    select: {
      courseName: true,
    },
  });
  // const topic = await prisma.topic.findMany();

  const users = await prisma.user.findMany({
    where: {
      id: session?.user?.id,
    },
  });
  //adds new student with skill if does not exist student does not have the topic for the course
  questionDisplay.map((eachQuestion: { question: { topicSlug: string } }) =>
    axios.post(
      `https://pybkt-api-deployment.herokuapp.com/add-student/${users[0]?.id}/${eachQuestion.question.topicSlug}`,
      {} // NOTE: will throw an error if student exist, but cannot get rid due to JS security concerns
    )
  );

  // // return smth like
  //{
  //   id: 'cl9dkw77d0000um9goo3a3xg9',
  //   userId: 'cl99wlo0i0000umswnh90pqs6',
  //   courseSlug: 'welcome-quiz',
  //   courseCompletion: 0,
  //   questions:[
  // {
  //   topicSlug: 'voltage-division-principle',
  //   questionContent: 'For the circuit shown in the figure above, what is the voltage V1?'
  // },
  // [Object], [Object], [Object], [Object] ]
  // }

  return {
    props: {
      courseName: course?.courseName,
      questionDisplay,
      user: users,
      url: context.params,
    },
  };
}
