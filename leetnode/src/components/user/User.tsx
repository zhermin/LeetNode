import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import LeetNodeNavbar from "@/components/Navbar";
import {
  AppShell,
  Avatar,
  Center,
  createStyles,
  Loader,
  Navbar,
  ScrollArea,
  Text,
} from "@mantine/core";
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
  { link: "", label: "Account", icon: IconUser },
  { link: "", label: "Statistics", icon: IconReportAnalytics },
  { link: "", label: "Challenge", icon: IconTargetArrow },
];

export default function User() {
  const session = useSession();

  const { classes, theme, cx } = useStyles();
  const [active, setActive] = useState("Account");

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery(
    ["userInfo", session?.data?.user?.id],
    async () => {
      const res = await axios.post("/api/user/get", {
        id: session?.data?.user?.id,
      });
      return res?.data;
    },
    { refetchOnMount: false, enabled: !!session?.data?.user?.id }
  );

  const links = tabs.map((item) => (
    <a
      className={cx(classes.link, {
        [classes.linkActive]: item.label === active,
      })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
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
          <LeetNodeNavbar />
        </>
      }
      navbar={
        <Navbar
          height="100%"
          width={{ sm: 200, lg: 300, base: 100 }}
          p="md"
          hiddenBreakpoint="sm"
          className={classes.navbar}
        >
          <Navbar.Section>
            <div className={classes.header}>
              <Center>
                <Avatar
                  size={100}
                  src={userInfo?.image}
                  radius={100}
                  className="mb-3"
                  imageProps={{ referrerPolicy: "no-referrer" }} // Avoid 403 forbidden error when loading google profile pics
                />
              </Center>
              <Center>
                <Text
                  className={classes.userName}
                  sx={{ lineHeight: 1, fontSize: "20px" }}
                  weight={500}
                  color={theme.colors.gray[9]}
                >
                  {userInfo?.name}
                </Text>
              </Center>
              <Center>
                {userInfo?.nickname && (
                  <Text
                    className={classes.userName}
                    sx={{ lineHeight: 1, fontSize: "16px" }}
                    weight={400}
                    color={theme.colors.gray[9]}
                  >
                    ({userInfo?.nickname})
                  </Text>
                )}
              </Center>
            </div>
            {links}
          </Navbar.Section>

          <Navbar.Section className={classes.footer}>
            <a
              href="#"
              className={classes.link}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>Logout</span>
            </a>
          </Navbar.Section>
        </Navbar>
      }
      footer={<LeetNodeFooter />}
    >
      <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
        {active === "Account" ? (
          <Account userInfo={userInfo} />
        ) : active === "Statistics" ? (
          <Statistics />
        ) : active === "Challenge" ? (
          <Challenge />
        ) : (
          <Text>Error</Text>
        )}
      </ScrollArea.Autosize>
    </AppShell>
  );
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    navbar: {
      backgroundColor: theme.fn.variant({
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
        0.1
      )}`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background ?? theme.primaryColor,
        0.1
      )}`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color: theme.white,
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor: theme.fn.lighten(
          theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .background ?? theme.primaryColor,
          0.1
        ),
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.white,
      opacity: 0.75,
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.lighten(
          theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .background ?? theme.primaryColor,
          0.15
        ),
        [`& .${icon}`]: {
          opacity: 0.9,
        },
      },
    },

    userName: {
      color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
      [theme.fn.smallerThan("sm")]: {
        display: "none",
      },
    },
  };
});
