import { evaluate } from "mathjs";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Latex from "react-latex-next";
import { Document, Page } from "react-pdf";

import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import MarkdownLatex from "@/components/MarkdownLatex";
import LeetNodeNavbar from "@/components/Navbar";
import {
	AppShell,
	Burger,
	Button,
	Container,
	createStyles,
	Grid,
	Group,
	Header,
	MediaQuery,
	Modal,
	Navbar,
	ScrollArea,
	SegmentedControl,
	Select,
	SimpleGrid,
	Text,
	TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
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
	IconUsers
} from "@tabler/icons";

const Editor = dynamic(import("@/components/editor/Editor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

const tabs = {
  account: [
    { link: "", label: "Slides and Videos", icon: IconBellRinging },
    { link: "", label: "Latex", icon: IconReceipt2 },
    { link: "", label: "Editor", icon: IconFingerprint },
    { link: "", label: "2", icon: IconKey },
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
  const [active, setActive] = useState("Latex");
  const [opened, setOpened] = useState(false);
  const [editorOpened, setEditorOpened] = useState(false);
  const [expr, setExpr] = useState("");

  const [numPages, setNumPages] = React.useState(1);
  const [pageNumber, setPageNumber] = React.useState(1);

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

  const form = useForm({
    initialValues: {
      title: "",
      courseName: "CS1010",
      postType: "Content",
    },
    validate: {
      title: (value) => value.trim().length === 0,
    },
  });

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
          <Header height={80}>
            <Container
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((opened) => !opened)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
              <LeetNodeNavbar />
            </Container>
          </Header>
        </>
      }
      footer={<LeetNodeFooter />}
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
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
              bgluesticker@mantine.dev
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
              <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
              <span>Open Editor</span>
            </a>

            <a
              href="#"
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>Logout</span>
            </a>
          </Navbar.Section>
        </Navbar>
      }
    >
      <ScrollArea.Autosize maxHeight={"calc(100vh - 180px)"}>
        <Modal
          opened={editorOpened}
          onClose={() => setEditorOpened(false)}
          size="xl"
          title="Markdown/LaTeX Editor"
        >
          <Editor />
        </Modal>
        {active === "Slides and Videos" ? (
          <>
            <Document file={slide} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
            <Group>
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
            </Group>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <MarkdownLatex>{markdown_with_video}</MarkdownLatex>
          </>
        ) : active === "Latex" ? (
          <>
            <MarkdownLatex>{qn1_markdown}</MarkdownLatex>
            <hr />
            <MarkdownLatex>{qn2_markdown}</MarkdownLatex>
            <hr />
            <MarkdownLatex>{markdown_latex}</MarkdownLatex>
          </>
        ) : active === "Editor" ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // mutation.mutate({
                //   userId: session?.data?.user?.id as string,
                //   title: form.values.title,
                //   message: message,
                //   courseName: form.values.courseName,
                //   postType: form.values.postType,
                // });
              }}
            >
              <TextInput
                label="Title"
                placeholder="Title"
                name="title"
                variant="filled"
                required
                {...form.getInputProps("title")}
              />
              <SimpleGrid
                cols={2}
                mt="lg"
                mb="lg"
                breakpoints={[{ maxWidth: "sm", cols: 1 }]}
              >
                <Select
                  data={["Content", "Quiz", "Misc"]}
                  placeholder="Choose thread type"
                  label="Thread Type"
                  defaultValue="Content"
                  {...form.getInputProps("postType")}
                />
                <Select
                  data={["CS1010", "CS2101", "CS2102"]}
                  placeholder="Choose course"
                  label="Course Name"
                  defaultValue="CS1010"
                  {...form.getInputProps("course")}
                />
              </SimpleGrid>
              <Text size="sm" weight={500}>
                Question
              </Text>
              <Editor />
              <Text size="sm" weight={500} mt="lg">
                Method
              </Text>
              <Grid mb="lg" justify="center" align="center" w="99%" grow>
                <Grid.Col span={1}>
                  <TextInput
                    placeholder="R_{TH} = \frac{R_2*R_3}{R_2+R_3}"
                    name="title"
                    value={expr}
                    onChange={(e) => setExpr(e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col
                  span={1}
                  className="bg-slate-200 rounded-md border border-solid border-slate-400"
                >
                  <Latex>{`$$ ${expr} $$`}</Latex>
                </Grid.Col>
              </Grid>
              <Group position="center" mt="xl">
                <Button type="submit" size="md">
                  Create Question
                </Button>
              </Group>
            </form>
          </>
        ) : (
          <></>
        )}
      </ScrollArea.Autosize>
    </AppShell>
  );
}

const markdown_latex = `Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$`;

// TODO: range data for each variable
// TODO: maybe list of variables for students only
// TODO: maybe have one-line descriptions for each step
// TODO: incorporate hints
// TODO: try randomizing
// TODO: expressions validation (must have = sign)

type QuestionData = {
  variables: Record<string, unknown>;
  expressions: string[];
  Answer: string;
  units: Record<string, string>;
};

const qn1_data: QuestionData = {
  variables: {
    V: 12,
    R_1: 4,
    R_2: 8,
    R_3: 10,
  },
  expressions: [
    "I_1 = V / R_1",
    "I_2 = V / R_2",
    "I_3 = V / R_3",
    "I_4 = I_1 + I_2 + I_3",
    "Answer = I_4",
  ],
  Answer: "I_4",
  units: {
    V: "V",
    R_1: "\\Omega",
    R_2: "\\Omega",
    R_3: "\\Omega",
    I_1: "A",
    I_2: "A",
    I_3: "A",
    I_4: "A",
    Answer: "A",
  },
};

const qn1_markdown = `
## Q1: Ohm's Law

Given the circuit below, find the total current flowing through the circuit.

![qn1 circuit diagram](testqn1.png)

### Variables

$$
${Object.keys(qn1_data.variables)
  .map((key) => `${key} = ${qn1_data.variables[key]} ${qn1_data.units[key]}`)
  .join(",~")}
$$

### Method

${qn1_data.expressions
  .map(
    (expr) => `
$$
${expr}~~~\\text{ (Unit: ${qn1_data.units[expr.split("=")[0]?.trim() ?? ""]})}
$$
`
  )
  .join("")}
`;

for (const expr of qn1_data.expressions) {
  evaluate(expr, qn1_data.variables);
}
console.log(qn1_data.variables.Answer);

const qn2_data: QuestionData = {
  variables: {
    R_1: 10,
    R_2: 15,
    R_3: 20,
    R_4: 25,
    V_1: 12,
    V_2: 8,
  },
  expressions: [
    "R_TH = (R_2*R_3) / (R_2+R_3)",
    "V_TH = V_1*(R_2/(R_2+R_3)) + V_2*(R_3/(R_2+R_3))",
    "I_L = V_TH / (R_TH + R_4)",
    "V_L = I_L * R_4",
    "P_L = V_L * I_L",
    "Answer = P_L",
  ],
  Answer: "P_L",
  units: {
    R_1: "\\Omega",
    R_2: "\\Omega",
    R_3: "\\Omega",
    R_4: "\\Omega",
    V_1: "V",
    V_2: "V",
    R_TH: "\\Omega",
    V_TH: "V",
    I_L: "A",
    V_L: "V",
    P_L: "W",
    Answer: "W",
  },
};

const qn2_markdown = `
## Q2: Thevenin Theorem

Given the circuit below, find the power across the load resistor R4 using the Thevenin theorem.

![qn2 circuit diagram](testqn1.png)

### Variables

$$
${Object.keys(qn2_data.variables)
  .map((key) => `${key} = ${qn2_data.variables[key]} ${qn2_data.units[key]}`)
  .join(",~")}
$$

### Method

1. Calculate the Thevenin resistance:

$$
R_{TH} = \\frac{R_2*R_3}{R_2+R_3}
$$

2. Calculate the Thevenin voltage:

$$
V_{TH} = V_1*\\frac{R_2}{R_2+R_3} + V_2*\\frac{R_3}{R_2+R_3}
$$

3. Calculate the load current:

$$
I_{L} = \\frac{V_{TH}}{R_{TH} + R_4}
$$

4. Calculate the voltage across the load resistor:

$$
V_L = I_L * R_4
$$

5. Calculate the power across the load resistor:

$$
P_L = V_L * I_L
$$

6. Answer

$$
${qn2_data.expressions[qn2_data.expressions.length - 1]} \\text{ | Unit: ${
  qn2_data.units[qn2_data.Answer]
}}
$$
`;

for (const expr of qn2_data.expressions) {
  evaluate(expr, qn2_data.variables);
}
console.log(qn2_data.variables.Answer);

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
