import axios from "axios";
import { useState } from "react";

import Analytics from "@/components/admin/Analytics";
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
  IconAdjustments,
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

export default function AdminPage() {
  // Mantine
  const { classes, cx } = useStyles();

  const [active, setActive] = useState("Dashboard");

  // Sidebar Tabs based on Fetched Data
  const tabs = [
    { label: "Dashboard", icon: IconGauge },
    { label: "Analytics", icon: IconPresentationAnalytics },
    { label: "Users", icon: IconFileAnalytics },
    { label: "Settings", icon: IconAdjustments },
  ];

  // Use the useQuery hook to make the API call to get all users
  const {
    data: users,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isErrorUsers,
  } = useQuery(["all-users"], async () => {
    const res = await axios.get("/api/forum/getAllUsers");
    console.log(res.data);
    return res.data;
  });

  if (isLoadingUsers || isFetchingUsers || !users)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isErrorUsers) return <div>Something went wrong!</div>;

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

            {/* <Navbar.Section className={classes.navbarEntry}>
          <UnstyledButton className={classes.control}>
            <Box
              sx={(theme) => ({
                padding: theme.spacing.sm,
                display: "flex",
                alignItems: "center",
              })}
            >
              <Group position="apart" spacing={0}>
                <ThemeIcon variant="light" size={30}>
                  <IconGauge />
                </ThemeIcon>
                <Box ml="md">Dashboard</Box>
              </Group>
            </Box>
          </UnstyledButton>
        </Navbar.Section>

        <Navbar.Section className={classes.navbarEntry}>
          <UnstyledButton className={classes.control}>
            <Box
              sx={(theme) => ({
                padding: theme.spacing.sm,
                display: "flex",
                alignItems: "center",
              })}
            >
              <Group position="apart" spacing={0}>
                <ThemeIcon variant="light" size={30}>
                  <IconGauge />
                </ThemeIcon>
                <Box ml="md">Dashboard</Box>
              </Group>
            </Box>
          </UnstyledButton>
        </Navbar.Section>

        <Navbar.Section className={classes.navbarEntry}>
          <UnstyledButton className={classes.control}>
            <Box
              sx={(theme) => ({
                padding: theme.spacing.sm,
                display: "flex",
                alignItems: "center",
              })}
            >
              <Group position="apart" spacing={0}>
                <ThemeIcon variant="light" size={30}>
                  <IconGauge />
                </ThemeIcon>
                <Box ml="md">Dashboard</Box>
              </Group>
            </Box>
          </UnstyledButton>
        </Navbar.Section> */}
          </Navbar>
        }
      >
        <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
          {active === "Dashboard" ? (
            <Dashboard />
          ) : active === "Analytics" ? (
            <Analytics />
          ) : active === "Users" ? (
            <Users users={users} />
          ) : (
            <Settings />
          )}
        </ScrollArea.Autosize>
      </AppShell>
    </>
  );
}
