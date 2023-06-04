import Link from "next/link";
import { useMemo, useState } from "react";

import Courses from "@/components/admin/Courses";
import Overview from "@/components/admin/Overview";
import Settings from "@/components/admin/Settings";
import Users from "@/components/admin/Users";
import QuestionViewer from "@/components/editor/QuestionViewer";
import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import { RoleBadge } from "@/components/misc/Badges";
import LeetNodeNavbar from "@/components/Navbar";
import {
  AppShell,
  Box,
  createStyles,
  Group,
  Navbar,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  Attempt,
  Course,
  Mastery,
  Question,
  QuestionWithAddedTime,
  Topic,
  User,
} from "@prisma/client";
import {
  IconAdjustments,
  IconArrowBarLeft,
  IconChartDots,
  IconPresentationAnalytics,
  IconPuzzle,
  IconUsers,
} from "@tabler/icons";

export type UsersWithMasteriesAndAttemptsType = (User & {
  attempts: Attempt[];
  masteries: Mastery[];
})[];

export type AttemptsInfoType = (Attempt & {
  user: User;
  course: Course;
  questionWithAddedTime: QuestionWithAddedTime & {
    question: Question & {
      topic: Topic;
    };
    attempts: Attempt[];
  };
})[];

// Sidebar Tabs based on Fetched Data
const tabs = [
  { label: "Overview", icon: IconChartDots },
  { label: "Questions", icon: IconPuzzle },
  { label: "Courses", icon: IconPresentationAnalytics },
  { label: "Users", icon: IconUsers },
  { label: "Settings", icon: IconAdjustments },
];

export default function AdminPage() {
  const { theme, classes, cx } = useStyles();

  const [active, setActive] = useState("Overview");
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [sidebarOpened, setSidebarOpened] = useState(!mobile);
  useMemo(() => setSidebarOpened(!mobile), [mobile]);

  return (
    <>
      <AppShell
        className={classes.appshell}
        navbarOffsetBreakpoint="sm"
        header={
          <>
            <LeetNodeHeader />
            <LeetNodeNavbar
              sidebarOpened={sidebarOpened}
              setSidebarOpened={setSidebarOpened}
            />
          </>
        }
        footer={<LeetNodeFooter />}
        navbar={
          sidebarOpened ? (
            <Navbar
              height={800}
              width={{ sm: 300 }}
              p="md"
              className={classes.navbar}
            >
              <Navbar.Section className={classes.header}>
                <Group position="apart">
                  <Text size="xl" weight={500}>
                    Admin
                  </Text>
                  <RoleBadge />
                </Group>
              </Navbar.Section>
              <Navbar.Section grow className={classes.navbarEntry}>
                {tabs.map((item) => (
                  <UnstyledButton
                    key={item.label}
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
                          <item.icon
                            className={classes.linkIcon}
                            stroke={1.5}
                          />
                        </ThemeIcon>
                        <Box ml="md">{item.label}</Box>
                      </Group>
                    </Box>
                  </UnstyledButton>
                ))}
              </Navbar.Section>
              <Navbar.Section className={classes.footer}>
                <Link href="/courses" passHref>
                  <Box className={classes.link}>
                    <IconArrowBarLeft
                      className={classes.linkIcon}
                      stroke={1.5}
                    />
                    <span>Back to Courses</span>
                  </Box>
                </Link>
              </Navbar.Section>
            </Navbar>
          ) : (
            <></>
          )
        }
      >
        <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
          {active === "Overview" ? (
            <Overview />
          ) : active === "Questions" ? (
            <QuestionViewer />
          ) : active === "Courses" ? (
            <Courses />
          ) : active === "Users" ? (
            <Users />
          ) : active === "Settings" ? (
            <Settings />
          ) : (
            <></>
          )}
        </ScrollArea.Autosize>
      </AppShell>
    </>
  );
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");

  return {
    navbar: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
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
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
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

    controlBox: {
      padding: theme.spacing.sm,
      display: "flex",
      alignItems: "center",
    },

    footer: {
      marginLeft: `calc(${theme.spacing.md} * -1)`,
      marginRight: `calc(${theme.spacing.md} * -1)`,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
      paddingTop: theme.spacing.sm,
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
