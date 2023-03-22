import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Document, Page } from "react-pdf";

import QuestionViewer from "@/components/editor/QuestionViewer";
import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import MarkdownLatex from "@/components/Latex";
import LeetNodeNavbar from "@/components/Navbar";
import {
  AppShell,
  Button,
  createStyles,
  Flex,
  Modal,
  Navbar,
  ScrollArea,
  SegmentedControl,
  Text,
} from "@mantine/core";
import {
  Icon2fa,
  IconBellRinging,
  IconDatabaseImport,
  IconFileAnalytics,
  IconFingerprint,
  IconKey,
  IconLicense,
  IconLogout,
  IconMessage2,
  IconMessages,
  IconReceipt2,
  IconReceiptRefund,
  IconSettings,
  IconShoppingCart,
  IconSwitchHorizontal,
  IconUsers,
} from "@tabler/icons";

const tabs = {
  account: [
    { link: "", label: "Slides and Videos", icon: IconBellRinging },
    { link: "", label: "Latex", icon: IconReceipt2 },
    { link: "", label: "Editor", icon: IconFingerprint },
    { link: "", label: "Questions", icon: IconKey },
    { link: "", label: "3", icon: IconDatabaseImport },
    { link: "", label: "4", icon: Icon2fa },
    { link: "", label: "5", icon: IconSettings },
  ],
  general: [
    { link: "", label: "Orders", icon: IconShoppingCart },
    { link: "", label: "Receipts", icon: IconLicense },
    { link: "", label: "Reviews", icon: IconMessage2 },
    { link: "", label: "Messages", icon: IconMessages },
    { link: "", label: "LeetNodeers", icon: IconUsers },
    { link: "", label: "Refunds", icon: IconReceiptRefund },
    { link: "", label: "Files", icon: IconFileAnalytics },
  ],
};

export default function Test() {
  const { theme, classes, cx } = useStyles();
  const [section, setSection] = useState<"account" | "general">("account");
  const [active, setActive] = useState("Editor");
  const [sidebarOpened, setSidebarOpened] = useState(true);
  const [editorOpened, setEditorOpened] = useState(false);

  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const links = tabs[section].map((item) => (
    <a
      className={cx(classes.link, {
        [classes.linkActive]: item.label === active,
      })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        toast(`Switched to ${item.label}!`, {
          icon: "🚀",
        });
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
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
      footer={<LeetNodeFooter />}
      navbar={
        sidebarOpened ? (
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!sidebarOpened}
            width={{ sm: 200, lg: 300 }}
          >
            <Navbar.Section>
              <Text
                weight={500}
                size="sm"
                className={classes.title}
                color="dimmed"
                mb="xs"
              >
                Question Generator
              </Text>

              <SegmentedControl
                value={section}
                onChange={(value: "account" | "general") => setSection(value)}
                transitionTimingFunction="ease"
                fullWidth
                data={[
                  { label: "Account", value: "account" },
                  { label: "System", value: "general" },
                ]}
              />
            </Navbar.Section>

            <Navbar.Section grow mt="xl">
              {links}
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
              <a className={classes.link} onClick={() => setEditorOpened(true)}>
                <IconSwitchHorizontal
                  className={classes.linkIcon}
                  stroke={1.5}
                />
                <span>Open Editor</span>
              </a>

              <a
                className={classes.link}
                onClick={() => toast("Toast!", { icon: "🍞" })}
              >
                <IconLogout className={classes.linkIcon} stroke={1.5} />
                <span>Toast!</span>
              </a>
            </Navbar.Section>
          </Navbar>
        ) : (
          <></>
        )
      }
    >
      <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
        <Modal
          opened={editorOpened}
          onClose={() => setEditorOpened(false)}
          size="xl"
          title="Markdown/LaTeX Editor"
        >
          Old Editor used to be here
        </Modal>
        {active === "Slides and Videos" ? (
          <>
            <Document file={slide} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
            <Flex gap="md">
              <Button
                onClick={() => {
                  if (pageNumber > 1) {
                    setPageNumber(pageNumber - 1);
                  }
                }}
              >
                {"<"}
              </Button>
              <Button
                onClick={() => {
                  if (pageNumber < numPages) {
                    setPageNumber(pageNumber + 1);
                  }
                }}
              >
                {">"}
              </Button>
            </Flex>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <MarkdownLatex>{markdown_with_video}</MarkdownLatex>
          </>
        ) : active === "Latex" ? (
          <>
            <MarkdownLatex>{`Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$`}</MarkdownLatex>
          </>
        ) : active === "Editor" ? (
          <QuestionViewer />
        ) : active === "Questions" ? (
          <></>
        ) : (
          <></>
        )}
      </ScrollArea.Autosize>
    </AppShell>
  );
}

const slide =
  "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007594/LeetNode/slides/w1s1-fundamentals-of-electricity.pdf";

const markdown_with_video = `# This is header 1

And this is a paragraph. By default, Tailwind removes all styles. We can override that in globals.css.

<iframe width="560" height="315" src="https://www.youtube.com/embed/hmIDKROT9Eg?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<br>

## This is header 2

### This is header 3

#### This is header 4

##### This is header 5

###### This is header 6

Lists
* Item 1
* Item 2
* Item 3
`;

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");

  return {
    navbar: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    },

    title: {
      textTransform: "uppercase",
      letterSpacing: -0.25,
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
      marginRight: theme.spacing.sm,
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

    footer: {
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
      paddingTop: theme.spacing.md,
    },
  };
});
