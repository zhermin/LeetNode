import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useSWRImmutable from "swr";

import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import LeetNodeNavbar from "@/components/Navbar";
import Account from "@/components/settings/Account";
import Calendar from "@/components/settings/Calendar";
import Statistics from "@/components/settings/Statistics";
import {
  AppShell,
  Center,
  createStyles,
  Loader,
  Navbar,
  ScrollArea,
  Text
} from "@mantine/core";
import {
  IconCalendarStats,
  IconLogout,
  IconReportAnalytics,
  IconUser
} from "@tabler/icons";

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
          .background!,
        0.1
      )}`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background!,
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
            .background!,
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
            .background!,
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

const data = [
  { link: "", label: "Account", icon: IconUser },
  { link: "", label: "Statistics", icon: IconReportAnalytics },
  { link: "", label: "Calendar", icon: IconCalendarStats },
];

export default function Settings() {
  const session = useSession();

  const { classes, theme, cx } = useStyles();
  const [active, setActive] = useState("Account");

  const [loading, setLoading] = useState(true);

  const [masteryData, setMasteryData] = useState();

  const fetcher = useCallback(
    async (url: string) => {
      const response = await axios.post(url, {
        id: session?.data?.user?.id,
      });
      console.log("fetching swr");
      return response?.data;
    },
    [session?.data?.user?.id]
  );

  const { data: userInfo, error } = useSWRImmutable("/api/user/get", fetcher); // Off auto-revalidation

  useEffect(() => {
    // Update the loading state
    if (userInfo) {
      setLoading(false);
    } else if (!userInfo) {
      setLoading(true);
    }
  }, [userInfo]);

  const links = data.map((item) => (
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

  useEffect(() => {
    axios
      .post("/api/pybkt/getAll", { id: session?.data?.user?.id })
      .then((response) => {
        setMasteryData(response?.data);
      });
  }, []);

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
          width={{ sm: 300 }}
          p="md"
          className={classes.navbar}
        >
          <Navbar.Section>
            <div className={classes.header}>
              <Center>
                <Image
                  src={userInfo?.image || ""}
                  alt={userInfo?.name || ""}
                  className="new-line ml-1 rounded-full mb-3"
                  width={100}
                  height={100}
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
          loading === true ? (
            <Center style={{ height: 500 }}>
              <Loader />
            </Center>
          ) : (
            <Account userInfo={userInfo} />
          )
        ) : active === "Statistics" ? (
          <Statistics data={masteryData} />
        ) : active === "Calendar" ? (
          <Calendar />
        ) : (
          <Text>Error</Text>
        )}
      </ScrollArea.Autosize>
    </AppShell>
  );
}
