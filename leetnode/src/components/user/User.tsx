import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader, { UserData } from "@/components/Header";
import LeetNodeNavbar from "@/components/Navbar";
import {
  AppShell,
  Avatar,
  Box,
  Center,
  Container,
  createStyles,
  Loader,
  Navbar,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useMediaQuery, useSessionStorage } from "@mantine/hooks";
import {
  IconLogout,
  IconReportAnalytics,
  IconTargetArrow,
  IconUser,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import Account from "./Account";
import Challenge from "./challenge/Challenge";
import Statistics from "./statistics/Statistics";

const tabs = [
  { label: "Account", icon: IconUser },
  { label: "Statistics", icon: IconReportAnalytics },
  { label: "Challenge", icon: IconTargetArrow },
];

export default function User() {
  const session = useSession();

  const { classes, theme, cx } = useStyles();
  const [active, setActive] = useSessionStorage({
    key: "dashboardActiveTab",
    defaultValue: "Account",
  });
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [sidebarOpened, setSidebarOpened] = useState(false);
  useMemo(() => {
    if (mobile !== undefined) {
      setSidebarOpened(!mobile);
    }
  }, [mobile]);

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery<UserData>({
    queryKey: ["userInfo", session?.data?.user?.id],
    queryFn: async () => {
      const res = await axios.post("/api/user", {
        id: session?.data?.user?.id,
      });
      return res?.data;
    },
    enabled: !!session?.data?.user?.id,
  });

  const links = tabs.map((item) => (
    <a
      className={cx(classes.link, {
        [classes.linkActive]: item.label === active,
      })}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        mobile && setSidebarOpened(false);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  if (!userInfo || isLoading || isError) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
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
      navbar={
        sidebarOpened ? (
          <Navbar
            height="100%"
            width={{ sm: 200, lg: 300 }}
            p="md"
            className={classes.navbar}
          >
            <Navbar.Section>
              <Box className={classes.header}>
                <Center>
                  <Avatar
                    size={100}
                    src={userInfo?.image}
                    radius={100}
                    className="mb-3"
                  />
                </Center>
                <Center>
                  <Text
                    className="whitespace-pre-wrap"
                    sx={{ lineHeight: 1, fontSize: "20px" }}
                    weight={500}
                    color="white"
                  >
                    {userInfo?.username}
                  </Text>
                </Center>
              </Box>
              {links}
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
              <a
                className={classes.link}
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <IconLogout className={classes.linkIcon} stroke={1.5} />
                <span>Logout</span>
              </a>
            </Navbar.Section>
          </Navbar>
        ) : (
          <></>
        )
      }
      footer={<LeetNodeFooter />}
    >
      <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
        <Container>
          {active === "Account" ? (
            <Account userInfo={userInfo} />
          ) : active === "Statistics" ? (
            <Statistics />
          ) : active === "Challenge" ? (
            <Challenge />
          ) : (
            <Text>Error</Text>
          )}
        </Container>
      </ScrollArea.Autosize>
    </AppShell>
  );
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    navbar: {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.fn.variant({
              variant: "filled",
              color: theme.primaryColor,
            }).background,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.fn.variant({
              variant: "filled",
              color: theme.primaryColor,
            }).background,
    },

    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background ?? theme.primaryColor,
        0.5
      )}`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background ?? theme.primaryColor,
        0.5
      )}`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color: "white",
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,
      cursor: "pointer",

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.fn.lighten(
                theme.fn.variant({
                  variant: "filled",
                  color: theme.primaryColor,
                }).background ?? theme.primaryColor,
                0.1
              ),
      },
    },

    linkIcon: {
      ref: icon,
      color: "white",
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.fn.variant({
                variant: "light",
                color: theme.primaryColor,
              }).background
            : theme.fn.lighten(
                theme.fn.variant({
                  variant: "filled",
                  color: theme.primaryColor,
                }).background ?? theme.primaryColor,
                0.15
              ),
        color: "white",
        [`& .${icon}`]: {
          color: "white",
          opacity: 0.9,
        },
      },
    },
  };
});
