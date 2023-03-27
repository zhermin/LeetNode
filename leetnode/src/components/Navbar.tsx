import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import toast from "react-hot-toast";

import {
  Box,
  Burger,
  Button,
  Center,
  Container,
  createStyles,
  Flex,
  Group,
  Header,
  Loader,
  Menu,
  SegmentedControl,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Role } from "@prisma/client";
import {
  IconBook,
  IconChevronDown,
  IconGauge,
  IconLock,
  IconLogout,
  IconMoon,
  IconSun,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import { RoleBadge } from "./misc/Badges";

const HEADER_HEIGHT = 80;

const FullLogo = () => (
  <Link href="/">
    <Image
      src="/logo/leetnode-banner-white.png"
      alt="LeetNode"
      width="0"
      height="0"
      sizes="100vw"
      className="h-auto max-h-12 w-full"
    />
  </Link>
);

const SmallLogo = () => (
  <Link href="/">
    <Image
      src="/logo/leetnode-logo-square.png"
      alt="LeetNode"
      width="0"
      height="0"
      sizes="100vw"
      className="h-6 w-full rounded-full"
    />
  </Link>
);

export default function Navbar({
  sidebarOpened,
  setSidebarOpened,
}: {
  sidebarOpened?: boolean;
  setSidebarOpened?: Dispatch<SetStateAction<boolean>>;
}) {
  const session = useSession();

  const { classes, theme, cx } = useStyles();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery(
    ["userInfo", session?.data?.user?.id],
    async () => {
      const res = await axios.post("/api/user", {
        id: session?.data?.user?.id,
      });
      return res?.data;
    },
    { enabled: !!session?.data?.user?.id }
  );

  return (
    <Header className={classes.header} height={HEADER_HEIGHT}>
      <Container className={classes.inner}>
        {sidebarOpened !== undefined && setSidebarOpened ? (
          <Flex align="center" gap="xl">
            <Burger
              opened={sidebarOpened}
              onClick={() => setSidebarOpened((o) => !o)}
              color={theme.colors.gray[6]}
            />
            <FullLogo />
          </Flex>
        ) : mobile ? (
          <SmallLogo />
        ) : (
          <FullLogo />
        )}

        {session.status === "unauthenticated" && (
          <Button color="cyan" onClick={() => signIn("google")}>
            Log In
          </Button>
        )}

        {session.status === "authenticated" && (
          <Menu
            width={260}
            radius="md"
            position="bottom-end"
            transition="pop-top-right"
            classNames={classes}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.user, {
                  [classes.userActive]: userMenuOpened,
                })}
              >
                <Group spacing={7}>
                  {isLoading === true || isError === true ? (
                    <Loader />
                  ) : (
                    <>
                      <Text
                        className={classes.userName}
                        sx={{ lineHeight: 1 }}
                        weight={500}
                        color={theme.colors.gray[9]}
                      >
                        {userInfo?.name}
                      </Text>
                      <Image
                        src={userInfo?.image || ""}
                        alt={userInfo?.name || ""}
                        className="ml-1 rounded-full"
                        width={25}
                        height={25}
                      />
                    </>
                  )}

                  <IconChevronDown size={12} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <SegmentedControl
                fullWidth
                value={colorScheme}
                onChange={(value: "light" | "dark") => {
                  // change mantine color scheme
                  toggleColorScheme(value);

                  // change tailwind color scheme
                  if (value === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }

                  // notification for color scheme change
                  toast.success(
                    value === "dark"
                      ? "Dark mode enabled"
                      : "Light mode enabled",
                    {
                      position: "top-right",
                      duration: 3000,
                      style: {
                        background:
                          value === "dark" ? theme.colors.dark[9] : "",
                        color: value === "dark" ? theme.white : "",
                      },
                    }
                  );
                }}
                data={[
                  {
                    value: "light",
                    label: (
                      <Center>
                        <IconSun size={16} stroke={2} />
                        <Box ml={10}>Light</Box>
                      </Center>
                    ),
                  },
                  {
                    value: "dark",
                    label: (
                      <Center>
                        <IconMoon size={16} stroke={2} />
                        <Box ml={10}>Dark</Box>
                      </Center>
                    ),
                  },
                ]}
              />

              <Menu.Divider />

              <Menu.Label>
                <Group position="apart">
                  <Text
                    weight={700}
                    color={
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.gray[9]
                    }
                  >
                    Signed In As:
                  </Text>
                  <RoleBadge />
                </Group>
                {session?.data?.user?.email}
              </Menu.Label>

              <Menu.Divider />

              <Menu.Item
                component={Link}
                href="/dashboard"
                icon={<IconGauge size={14} stroke={1.5} />}
              >
                Dashboard
              </Menu.Item>
              <Menu.Item
                component={Link}
                href="/courses"
                icon={<IconBook size={14} stroke={1.5} />}
              >
                Learn
              </Menu.Item>

              <Menu.Divider />

              {(session?.data?.user?.role === Role.SUPERUSER ||
                session?.data?.user?.role === Role.ADMIN) && (
                <Menu.Item
                  component={Link}
                  href="/admin"
                  icon={<IconLock size={14} stroke={1.5} />}
                  color={theme.colors.red[6]}
                >
                  Admin Panel
                </Menu.Item>
              )}
              <Menu.Item
                onClick={() => signOut({ callbackUrl: "/" })}
                icon={<IconLogout size={14} stroke={1.5} />}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Container>
    </Header>
  );
}

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[2]
    }`,
  },

  inner: {
    height: HEADER_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoFull: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  logoSmall: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  item: {
    "&[data-hovered]": {
      backgroundColor: theme.colors.cyan[0],
      color: theme.colors.cyan[7],
    },
  },

  user: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.cyan[0],
      borderRadius: theme.radius.md,
    },
  },

  userName: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  userActive: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },
}));
