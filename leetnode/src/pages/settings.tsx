import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [userName, setUserName] = useState("");
  const [userNusnetId, setUserNusnetId] = useState("");
  const [userImage, setUserImage] = useState("");

  const [masteryData, setMasteryData] = useState();

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
    setLoading(true);
    console.log("fetching data");
    axios
      .post("/api/user/get", {
        id: session?.data?.user?.id,
      })
      .then((response) => {
        setUserName(response?.data?.name);
        setUserNusnetId(response?.data?.nusnetId);
        setUserImage(response?.data?.image);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  }, [session?.data?.user?.id]);

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
          <LeetNodeNavbar userName={userName} userImage={userImage} />
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
                  src={userImage || ""}
                  alt={userName || ""}
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
                  {userName}
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
            <>
              <Account
                loading={loading}
                userName={userName}
                setUserName={setUserName}
                userNusnetId={userNusnetId}
                setUserNusnetId={setUserNusnetId}
                userImage={userImage}
                setUserImage={setUserImage}
              />
            </>
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
