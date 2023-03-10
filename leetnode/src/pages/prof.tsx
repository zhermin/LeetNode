import axios from "axios";
import Link from "next/link";
import { useState } from "react";

import Courses from "@/components/admin/Courses";
import Dashboard from "@/components/admin/Dashboard";
import Settings from "@/components/admin/Settings";
import Users from "@/components/admin/Users";
import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import LeetNodeNavbar from "@/components/Navbar";
import {
  AppShell,
  Box,
  Center,
  Container,
  createStyles,
  Group,
  Header,
  Loader,
  Navbar,
  ScrollArea,
  ThemeIcon,
  UnstyledButton,
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
  IconAdjustments,
  IconArrowBarLeft,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconPresentationAnalytics,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");

  return {
    navbar: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
      paddingBottom: 0,
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

    header: {
      padding: theme.spacing.md,
      paddingTop: 0,
      marginLeft: -theme.spacing.md,
      marginRight: -theme.spacing.md,
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
    },

    navbarEntry: {
      marginLeft: -theme.spacing.md,
      marginRight: -theme.spacing.md,
    },

    control: {
      fontWeight: 500,
      display: "block",
      width: "100%",
      padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
      color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
      fontSize: theme.fontSizes.sm,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[7]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },

    adminBox: {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
      fontWeight: 500,
      fontSize: theme.fontSizes.sm,
    },

    controlBox: {
      padding: theme.spacing.sm,
      display: "flex",
      alignItems: "center",
    },

    footer: {
      marginLeft: `calc(${theme.spacing.md} * -1)`,
      marginRight: `calc(${theme.spacing.md} * -1)`,
      borderTop: `${50} solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
    },

    appshell: {
      main: {
        background:
          theme.colorScheme === "dark"
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
      },
    },
  };
});

interface UsersWithMasteriesAndAttempts {
  id: string;
  nusnetId: string | null;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string;
  lastActive: string;
  emailFrequency: string;
  role: Role;
  masteries: Mastery[];
  attempts: Attempt[];
}
[];

interface TopicsInterface {
  topicLevel: string;
  topicSlug: string;
  topicName: string;
}
[];

type CourseInfoType = Course & {
  topics: Topic[];
  userCourseQuestions: UserCourseQuestion[];
};

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

export default function AdminPage() {
  // Mantine
  const { classes, cx } = useStyles();

  const [active, setActive] = useState("Dashboard");

  // Sidebar Tabs based on Fetched Data
  const tabs = [
    { label: "Dashboard", icon: IconGauge },
    { label: "Courses", icon: IconPresentationAnalytics },
    { label: "Users", icon: IconFileAnalytics },
    { label: "Settings", icon: IconAdjustments },
  ];

  // Use the useQuery hook to make the API call to get all users
  const {
    data: usersData,
    isLoading: isLoadingUsersData,
    isFetching: isFetchingUsersData,
    isError: isErrorUsersData,
  } = useQuery<UsersWithMasteriesAndAttempts[]>(
    ["all-users-data"],
    async () => {
      const res = await axios.get("/api/prof/getAllUsersData");
      console.log(res.data);
      return res.data;
    }
  );
  const {
    data: topics,
    isLoading: isLoadingTopics,
    isFetching: isFetchingTopics,
    isError: isErrorTopics,
  } = useQuery(["all-topics"], async () => {
    const res = await axios.get("/api/prof/getAllTopics");
    console.log(res.data);
    return res.data;
  });

  const {
    data: courses,
    isLoading: isLoadingCourses,
    isFetching: isFetchingCourses,
    isError: isErrorCourses,
  } = useQuery(["all-courses"], async () => {
    const res = await axios.get("/api/prof/getAllCourses");
    console.log(res.data);
    return res.data;
  });

  const {
    data: attempts,
    isLoading: isLoadingAttempts,
    isFetching: isFetchingAttempts,
    isError: isErrorAttempts,
  } = useQuery(["all-attempts"], async () => {
    const res = await axios.get("/api/prof/getAllAttempts");
    console.log(res.data);
    return res.data;
  });

  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isFetching: isFetchingQuestions,
    isError: isErrorQuestions,
  } = useQuery(["all-questions"], async () => {
    const res = await axios.get("/api/prof/getAllQuestions");
    console.log(res.data);
    return res.data;
  });

  if (
    isLoadingUsersData ||
    isFetchingUsersData ||
    !usersData ||
    isLoadingTopics ||
    isFetchingTopics ||
    !topics ||
    isLoadingCourses ||
    isFetchingCourses ||
    !courses ||
    isLoadingAttempts ||
    isFetchingAttempts ||
    !attempts ||
    isLoadingQuestions ||
    isFetchingQuestions ||
    !questions
  )
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (
    isErrorUsersData ||
    isErrorTopics ||
    isErrorCourses ||
    isErrorAttempts ||
    isErrorQuestions
  )
    return <div>Something went wrong!</div>;

  return (
    <>
      <AppShell
        className={classes.appshell}
        navbarOffsetBreakpoint="sm"
        header={
          <>
            <LeetNodeHeader />
            <Header height={80}>
              <Container
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <LeetNodeNavbar />
              </Container>
            </Header>
          </>
        }
        footer={<LeetNodeFooter />}
        navbar={
          <Navbar
            height={800}
            width={{ sm: 300 }}
            p="md"
            className={classes.navbar}
          >
            <Navbar.Section className={classes.header}>
              <Group position="apart">
                <IconLock />
                <Box className={classes.adminBox}>Admin</Box>
              </Group>
            </Navbar.Section>

            {tabs.map((item) => (
              <Navbar.Section key={item.label} className={classes.navbarEntry}>
                <UnstyledButton
                  className={cx(classes.control, {
                    [classes.linkActive]: item.label === active,
                  })}
                  onClick={(event: { preventDefault: () => void }) => {
                    event.preventDefault();
                    setActive(item.label);
                  }}
                >
                  <Box className={classes.controlBox}>
                    <Group position="apart" spacing={0}>
                      <ThemeIcon variant="light" size={30}>
                        <item.icon className={classes.linkIcon} stroke={1.5} />
                      </ThemeIcon>
                      <Box ml="md">{item.label}</Box>
                    </Group>
                  </Box>
                </UnstyledButton>
              </Navbar.Section>
            ))}
            <Navbar.Section className={classes.footer}>
              <Link href="/courses" passHref>
                <Box className={classes.link}>
                  <IconArrowBarLeft className={classes.linkIcon} stroke={1.5} />
                  <span>Back to Courses</span>
                </Box>
              </Link>
            </Navbar.Section>
          </Navbar>
        }
      >
        <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
          {active === "Dashboard" ? (
            <Dashboard
              users={usersData as UsersWithMasteriesAndAttempts[]}
              courses={courses as CourseInfoType[]}
              attempts={attempts as AttemptsInterface[]}
            />
          ) : active === "Courses" ? (
            <Courses
              courses={courses as CourseInfoType[]}
              users={usersData as UsersWithMasteriesAndAttempts[]}
              attempts={attempts as AttemptsInterface[]}
              questions={questions as QuestionsInterface[]}
            />
          ) : active === "Users" ? (
            <Users
              users={usersData as UsersWithMasteriesAndAttempts[]}
              topics={topics as TopicsInterface[]}
            />
          ) : (
            <Settings
              users={usersData as UsersWithMasteriesAndAttempts[]}
              topics={topics as TopicsInterface[]}
            />
          )}
        </ScrollArea.Autosize>
      </AppShell>
    </>
  );
}
