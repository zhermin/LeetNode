import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Login from "@/components/auth/Login";
import { UserData } from "@/components/Header";
import { RoleBadge } from "@/components/misc/Badges";
import {
  ActionIcon,
  Box,
  Burger,
  Button,
  Center,
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
  IconCheckupList,
  IconChevronDown,
  IconGauge,
  IconLicense,
  IconLock,
  IconLogout,
  IconMoon,
  IconSun,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

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
  withBorder = true,
}: {
  sidebarOpened?: boolean;
  setSidebarOpened?: Dispatch<SetStateAction<boolean>>;
  withBorder?: boolean;
}) {
  const session = useSession();
  const router = useRouter();

  const { classes, theme, cx } = useStyles();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const [loginMenuOpened, setLoginMenuOpened] = useState(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  useEffect(() => {
    if (router.query.callbackUrl && session.status === "authenticated") {
      router.replace(
        !Array.isArray(router.query.callbackUrl)
          ? router.query.callbackUrl
          : (router.query.callbackUrl[0] as string)
      );
      toast.success("Successfully logged in!", { id: "loginSuccess" });
      return;
    }

    if (router.query.error) {
      let errorMessage = "";
      const errorToastId = "authError";
      switch (router.query.error) {
        case "AccessDenied":
          errorMessage =
            "Unfortunately you are not authorized to access LeetNode without a valid invite. \n\nIn the meantime, you may join our waitlist or if you think this is a mistake, please contact support.";
          break;
        case "Verification":
          errorMessage =
            "Your invite link has been used before or has expired. Please contact support to get a new invite.";
          break;
        case "OAuthAccountNotLinked":
          errorMessage = "Please use the same login method as before.";
          break;
        default:
          console.error("[AUTH UNCAUGHT ERROR]", router.query.error);
          errorMessage =
            "An error occurred while trying to log in. Please contact support if this persist";
      }
      toast.error(errorMessage, { id: errorToastId });
      router.replace(router.pathname, undefined, { shallow: true });
      setTimeout(() => {
        setLoginMenuOpened(true);
      }, 1000);
    } else if (router.query.callbackUrl && session.status !== "loading") {
      toast("Please log in to continue.", {
        id: "callbackUrl",
        icon: "🔒",
        duration: 2000,
      });
      setTimeout(() => {
        setLoginMenuOpened(true);
      }, 1000);
    }
  }, [router, session]);

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userInfo", session?.data?.user?.id],
    queryFn: async () => {
      const res = await axios.post<UserData>("/api/user", {
        id: session?.data?.user?.id,
      });
      return res?.data;
    },
    enabled: !!session?.data?.user?.id,
  });

  const handleColorSchemeChange = () => {
    const value = colorScheme === "dark" ? "light" : "dark";

    // Change mantine color scheme
    toggleColorScheme(value);

    // Change tailwind color scheme
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Notification for color scheme change
    toast.success(
      value === "dark" ? "Dark mode enabled" : "Light mode enabled",
      {
        position: "bottom-right",
        duration: 3000,
        style: {
          background: value === "dark" ? theme.colors.dark[9] : "",
          color: value === "dark" ? theme.white : "",
        },
      }
    );
  };

  return (
    <Header height={HEADER_HEIGHT} withBorder={withBorder}>
      <Box className={classes.inner}>
        {sidebarOpened !== undefined && setSidebarOpened ? (
          <Flex align="center" gap="xl">
            <Burger
              opened={sidebarOpened}
              onClick={() => setSidebarOpened((o) => !o)}
              color={theme.colors.gray[5]}
            />
            {mobile ? <SmallLogo /> : <FullLogo />}
          </Flex>
        ) : mobile ? (
          <SmallLogo />
        ) : (
          <FullLogo />
        )}

        {session.status === "loading" && (
          <Center>
            <ActionIcon radius="xl" mr="xl" onClick={handleColorSchemeChange}>
              {colorScheme === "dark" ? (
                <IconSun size={18} stroke={1.5} />
              ) : (
                <IconMoon size={18} stroke={1.5} />
              )}
            </ActionIcon>
            <Loader />
          </Center>
        )}

        {session.status === "unauthenticated" && (
          <Center>
            <ActionIcon radius="xl" mr="xl" onClick={handleColorSchemeChange}>
              {colorScheme === "dark" ? (
                <IconSun size={18} stroke={1.5} />
              ) : (
                <IconMoon size={18} stroke={1.5} />
              )}
            </ActionIcon>
            <Menu
              shadow="xl"
              width={320}
              radius="md"
              position="bottom-end"
              transition="skew-up"
              onOpen={() => {
                mobile && setSidebarOpened?.(false);
              }}
              opened={loginMenuOpened}
              onClose={() => setLoginMenuOpened(false)}
            >
              <Menu.Target>
                <Button
                  onClick={() => setLoginMenuOpened(true)}
                  className={classes.control}
                >
                  Log In
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Login setLoginMenuOpened={setLoginMenuOpened} />
              </Menu.Dropdown>
            </Menu>
          </Center>
        )}

        {session.status === "authenticated" && (
          <Menu
            shadow="lg"
            width={260}
            radius="md"
            position="bottom-end"
            transition="pop-top-right"
            classNames={classes}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => {
              mobile && setSidebarOpened?.(false);
              setUserMenuOpened(true);
            }}
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
                      <Image
                        src={userInfo.image || ""}
                        alt={userInfo.username}
                        className="mr-2 rounded-full"
                        width={25}
                        height={25}
                      />
                      <Text
                        className={classes.userName}
                        sx={{ lineHeight: 1 }}
                        weight={500}
                        color={theme.colors.gray[9]}
                        mr="xs"
                      >
                        {userInfo?.username}
                      </Text>
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
                onChange={() => handleColorSchemeChange()}
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
                  <RoleBadge role={session?.data?.user?.role} />
                </Group>
                {session?.data?.user?.email}
              </Menu.Label>

              <Menu.Divider />

              <Menu.Label c="cyan">Personal</Menu.Label>
              <Menu.Item
                component={Link}
                href="/dashboard"
                icon={<IconGauge size={14} stroke={1.5} />}
                color="cyan"
              >
                Dashboard
              </Menu.Item>
              <Menu.Item
                component={Link}
                href="/courses"
                icon={<IconBook size={14} stroke={1.5} />}
                color="cyan"
              >
                Learn
              </Menu.Item>

              <Menu.Label c="yellow">NUS</Menu.Label>
              <Menu.Item
                component={Link}
                href="/consent"
                icon={<IconLicense size={14} stroke={1.5} />}
                color="yellow"
              >
                Consent Form
              </Menu.Item>
              <Menu.Item
                component={Link}
                href="https://forms.gle/XCwZF28MKbaDnwGF9"
                target="_blank"
                icon={<IconCheckupList size={14} stroke={1.5} />}
                color="yellow"
              >
                Usage Survey
              </Menu.Item>

              <Menu.Divider />

              {(session?.data?.user?.role === Role.SUPERUSER ||
                session?.data?.user?.role === Role.ADMIN) && (
                <Menu.Item
                  component={Link}
                  href="/admin"
                  icon={<IconLock size={14} stroke={1.5} />}
                  color="red"
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
      </Box>
    </Header>
  );
}

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `0 ${theme.spacing.md}px`,
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

  item: {},

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

  control: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).background
        : theme.fn.variant({
            variant: "filled",
            color: theme.primaryColor,
          }).background,
    color:
      theme.colorScheme === "dark"
        ? theme.fn.variant({ variant: "light", color: theme.primaryColor })
            .color
        : theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .color,
  },
}));
