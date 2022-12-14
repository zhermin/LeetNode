import {
  createStyles,
  Header,
  Container,
  Button,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Box,
  useMantineColorScheme,
  SegmentedControl,
  Center,
} from "@mantine/core";
import {
  IconBook,
  IconStar,
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconSun,
  IconMoon,
} from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

const HEADER_HEIGHT = 80;

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

export default function Navbar() {
  const session = useSession();

  const { classes, theme, cx } = useStyles();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <Header className={classes.header} height={HEADER_HEIGHT}>
      <Container className={classes.inner}>
        {mobile ? (
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
        ) : (
          <Link href="/">
            <Image
              src="/logo/leetnode-banner-white.png"
              alt="LeetNode"
              width="0"
              height="0"
              sizes="100vw"
              className="h-auto w-full max-h-12"
            />
          </Link>
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
                  <Text
                    className={classes.userName}
                    sx={{ lineHeight: 1 }}
                    weight={500}
                    color={theme.colors.gray[9]}
                  >
                    {session?.data?.user?.name}
                  </Text>
                  <Image
                    src={session?.data?.user?.image || ""}
                    alt={session?.data?.user?.name || ""}
                    className="ml-1 rounded-full"
                    width={25}
                    height={25}
                  />
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
                {session?.data?.user?.email}
              </Menu.Label>

              <Menu.Divider />

              <Menu.Item
                component={Link}
                href="/courses"
                icon={<IconBook size={14} stroke={1.5} />}
              >
                Courses
              </Menu.Item>
              <Menu.Item
                component={Link}
                href="/profile"
                icon={<IconStar size={14} stroke={1.5} />}
              >
                Masteries
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                component={Link}
                href="/"
                icon={<IconSettings size={14} stroke={1.5} />}
              >
                Account settings
              </Menu.Item>
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
