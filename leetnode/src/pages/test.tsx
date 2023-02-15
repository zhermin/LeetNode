import { evaluate } from "mathjs";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Latex from "react-latex-next";
import { Document, Page } from "react-pdf";

import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import MarkdownLatex from "@/components/MarkdownLatex";
import LeetNodeNavbar from "@/components/Navbar";
import { CustomMath } from "@/server/Utils";
import {
	ActionIcon,
	AppShell,
	Box,
	Button,
	Center,
	Chip,
	Code,
	createStyles,
	Divider,
	Flex,
	Modal,
	Navbar,
	ScrollArea,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
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
	IconPlus,
	IconReceipt2,
	IconReceiptRefund,
	IconRefresh,
	IconSettings,
	IconShoppingCart,
	IconSwitchHorizontal,
	IconTrash,
	IconUsers
} from "@tabler/icons";

const Editor = dynamic(import("@/components/editor/Editor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

type QuestionData = {
  variables: Record<string, number>;
  qn_variables: string[];
  variable_ranges: {
    [key: string]: {
      toRandomize: boolean;
      min?: number;
      max?: number;
      decimalPlaces?: number;
    };
  };
  expressions: string[];
  Answer: string;
  units: Record<string, string>;
};

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
  const [active, setActive] = useState("Editor");
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [editorOpened, setEditorOpened] = useState(false);

  const [numPages, setNumPages] = React.useState(1);
  const [pageNumber, setPageNumber] = React.useState(1);

  const [qn1Data, setQn1Data] = useState<QuestionData>({
    variables: {
      V: 12,
      R_1: 4,
      R_2: 8,
      R_3: 10,
    },
    qn_variables: ["V", "R_1", "R_2", "R_3"],
    variable_ranges: {
      V: { toRandomize: true, min: 1, max: 12, decimalPlaces: 0 },
      R_1: { toRandomize: false }, // 20 possibilites
      R_2: { toRandomize: true, min: 1, max: 20, decimalPlaces: 2 },
      R_3: { toRandomize: true, min: 1, max: 20, decimalPlaces: 2 },
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
      V: "\\text{V}",
      R_1: "\\Omega",
      R_2: "\\Omega",
      R_3: "\\Omega",
      I_1: "\\Omega",
      I_2: "\\text{A}",
      I_3: "\\text{A}",
      I_4: "\\text{A}",
      Answer: "\\text{A}",
    },
  });

  for (const expr of qn1Data.expressions) {
    evaluate(expr, qn1Data.variables);
  }

  const [qn1Markdown, setQn1Markdown] = useState(``);
  useEffect(() => {
    setQn1Markdown(`
## Q1: Ohm's Law

Given the circuit below, find the total current flowing through the circuit.

![qn1 circuit diagram](testqn1.png)

### Variables

$$
${qn1Data.qn_variables
  .map((key) => `${key} = ${qn1Data.variables[key]}~${qn1Data.units[key]}`)
  .join(",~")}
$$

### Method

${qn1Data.expressions
  .map(
    (expr) => `
$$
${expr}~~~(${qn1Data.units[expr.split("=")[0]?.trim() ?? ""]})
$$
`
  )
  .join("")}

### Answer

$$
${qn1Data.Answer} = ${qn1Data.variables[qn1Data.Answer]?.toFixed(2)} ${
      qn1Data.units[qn1Data.Answer]
    }
$$
`);
  }, [qn1Data]);

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

  // Question Generator

  const form = useForm({
    initialValues: {
      title: "",
      courseName: "CS1010",
      topics: "Content",
      difficulty: "Medium",
      variables: [
        {
          key: randomId(),
          name: "",
          unit: "",
          default: "",
          forStudents: true,
          randomize: false,
          isFinalAnswer: false,
        },
      ],
      methods: [{ key: 1, expr: "" }],
    },
    validate: {
      title: (value) => value.trim().length === 0,
    },
  });

  const [finalAnsPreview, setFinalAnsPreview] = useState(
    "\\text{Invalid Variables or Methods}"
  );
  const handleFinalAnsPreviewChange = () => {
    const rawVariables: {
      [key: string]: number;
    } = form.values.variables.reduce(
      (obj, item) => ({
        ...obj,
        [item.name]: item.default,
      }),
      {}
    );

    for (const method of form.values.methods) {
      evaluate(method.expr, rawVariables);
    }

    const finalAnswer = form.values.variables.find(
      (item) => item.isFinalAnswer
    );
    if (finalAnswer && finalAnswer.name && finalAnswer.unit) {
      setFinalAnsPreview(`
        ${finalAnswer.name} (${finalAnswer.unit}) = ${
        rawVariables[finalAnswer.name]
      }`);
    } else {
      setFinalAnsPreview("\\text{Invalid Variables or Methods}");
    }
    toast.success("Preview Updated!");
  };

  const varFields = form.values.variables.map((item, index) => (
    <Stack
      key={item.key}
      bg={theme.colors.gray[1]}
      p="md"
      my="md"
      className="rounded-md"
    >
      <Flex gap="md" align="center">
        <TextInput
          label="Variable Name"
          placeholder="R_{TH}"
          sx={{ flex: 1 }}
          value={item.name}
          onChange={(event) => {
            form.setFieldValue(`variables.${index}.name`, event.target.value);
          }}
        />
        <TextInput
          label="Unit"
          placeholder="\text{A} or \Omega"
          sx={{ flex: 1 }}
          value={item.unit}
          onChange={(event) => {
            form.setFieldValue(`variables.${index}.unit`, event.target.value);
          }}
        />
        <TextInput
          label="Default Value"
          placeholder={
            form.values.variables[index]?.forStudents ? "20" : "Derived"
          }
          sx={{ flex: 1 }}
          disabled={!item.forStudents}
          value={item.default}
          onChange={(event) => {
            form.setFieldValue(
              `variables.${index}.default`,
              event.target.value
            );
          }}
        />
        <Box
          sx={{ flex: 1, alignSelf: "stretch" }}
          className="bg-slate-200 rounded-md border border-solid border-slate-300"
        >
          <Latex>{`$$ ${item.name}${item.unit ? "~(" + item.unit + ")" : ""}${
            item.default ? "~=" + item.default : ""
          } $$`}</Latex>
        </Box>
        <Chip
          onClick={() => {
            form.setFieldValue(`variables.${index}.isFinalAnswer`, false);
            form.setFieldValue(`variables.${index}.default`, "");
          }}
          {...form.getInputProps(`variables.${index}.forStudents`, {
            type: "checkbox",
          })}
        >
          For Students
        </Chip>
        {item.forStudents ? (
          <Chip
            disabled={!item.forStudents}
            {...form.getInputProps(`variables.${index}.randomize`, {
              type: "checkbox",
            })}
          >
            Random
          </Chip>
        ) : (
          <Chip
            color="red"
            disabled={
              !item.isFinalAnswer &&
              form.values.variables.some((item) => item.isFinalAnswer)
            }
            // onClick={handleFinalAnsPreviewChange}
            {...form.getInputProps(`variables.${index}.isFinalAnswer`, {
              type: "checkbox",
            })}
          >
            Final Ans
          </Chip>
        )}
        <ActionIcon
          variant="transparent"
          onClick={() => form.removeListItem("variables", index)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Flex>
      {item.randomize && item.forStudents && (
        <Flex gap="md" align="center">
          <Text fw={500} fz="sm">
            Min
          </Text>
          <TextInput
            placeholder="1"
            sx={{ flex: 1 }}
            onChange={(event) => {
              form.setFieldValue(`variables.${index}.min`, event.target.value);
            }}
          />
          <Text fw={500} fz="sm">
            Max
          </Text>
          <TextInput
            placeholder="30"
            sx={{ flex: 1 }}
            onChange={(event) => {
              form.setFieldValue(`variables.${index}.max`, event.target.value);
            }}
          />
          <Text fw={500} fz="sm">
            Decimal Places
          </Text>
          <TextInput
            placeholder="0"
            sx={{ flex: 1 }}
            onChange={(event) => {
              form.setFieldValue(`variables.${index}.step`, event.target.value);
            }}
          />
        </Flex>
      )}
    </Stack>
  ));

  const newVar = () => {
    form.insertListItem("variables", {
      key: randomId(),
      name: "",
      forStudents: true,
      randomize: false,
      isFinalAnswer: false,
    });
  };

  const methodFields = form.values.methods.map((item, index) => (
    <Flex
      key={item.key}
      gap="md"
      align="center"
      bg={theme.colors.gray[1]}
      p="md"
      my="md"
      className="rounded-md"
    >
      <Text color="dimmed">{item.key}</Text>
      <TextInput
        placeholder="R_{TH} = \frac{R_2*R_3}{R_2+R_3}"
        sx={{ flex: 1 }}
        value={item.expr}
        onChange={(event) => {
          form.setFieldValue(`methods.${index}.expr`, event.target.value);
        }}
      />
      <Box
        sx={{ flex: 1, alignSelf: "stretch" }}
        className="bg-slate-200 rounded-md border border-solid border-slate-300"
      >
        <Latex>{`$$ ${item.expr} $$`}</Latex>
      </Box>
      <ActionIcon
        variant="transparent"
        onClick={() => form.removeListItem("methods", index)}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Flex>
  ));

  const newMethod = () => {
    form.insertListItem("methods", {
      key: methodFields.length + 1,
      expr: "",
    });
  };

  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
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
                onClick={() => {
                  const newQn1Data = { ...qn1Data };
                  for (const v of qn1Data.qn_variables) {
                    if (qn1Data.variable_ranges[v]?.toRandomize) {
                      newQn1Data.variables[v] = CustomMath.random(
                        qn1Data.variable_ranges[v]?.min ?? 0,
                        qn1Data.variable_ranges[v]?.max ?? 0,
                        qn1Data.variable_ranges[v]?.decimalPlaces ?? 0
                      );
                    }
                  }

                  for (const expr of qn1Data.expressions) {
                    evaluate(expr, newQn1Data.variables);
                  }
                  console.log(newQn1Data.variables.Answer);

                  setQn1Data(newQn1Data);
                }}
              >
                <IconLogout className={classes.linkIcon} stroke={1.5} />
                <span>Randomize</span>
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
          <Editor />
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
            <MarkdownLatex>{qn1Markdown}</MarkdownLatex>
            <hr />
            <MarkdownLatex>{qn2_markdown}</MarkdownLatex>
            <hr />
            <MarkdownLatex>{markdown_latex}</MarkdownLatex>
            <hr />
            <MarkdownLatex>{circuitikz_test}</MarkdownLatex>
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
                cols={3}
                mt="lg"
                breakpoints={[{ maxWidth: "sm", cols: 1 }]}
              >
                <Select
                  data={["CS1010", "CS2101", "CS2102"]}
                  placeholder="Select course"
                  label="Course Name"
                  defaultValue="CS1010"
                  required
                  {...form.getInputProps("course")}
                />
                <Select
                  data={["Content", "Quiz", "Misc"]}
                  placeholder="Select all tested topics"
                  label="Topics"
                  defaultValue="Content"
                  required
                  {...form.getInputProps("postType")}
                />
                <Select
                  data={["Easy", "Medium", "Hard"]}
                  placeholder="Select question difficulty"
                  label="Difficulty"
                  required
                  {...form.getInputProps("difficulty")}
                />
              </SimpleGrid>

              <Text weight={500} size="sm" mb="xs" mt="lg">
                Question
              </Text>
              <Editor />

              <Text weight={500} size="sm" mt="xl">
                Variables
              </Text>
              {varFields.length > 0 ? (
                <>
                  {varFields}
                  <Button
                    fullWidth
                    variant="light"
                    color="gray"
                    className="bg-gray-100"
                    radius="sm"
                    mt="lg"
                    onClick={() => newVar()}
                  >
                    <IconPlus size={16} />
                  </Button>
                </>
              ) : (
                <Center mt="lg">
                  <Text color="dimmed" align="center">
                    Add at least one variable
                  </Text>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    className="bg-gray-100"
                    radius="xl"
                    ml="lg"
                    onClick={() => newVar()}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Center>
              )}

              <Text weight={500} size="sm" mt="xl">
                Methods
              </Text>
              {methodFields.length > 0 ? (
                <>
                  {methodFields}
                  <Button
                    fullWidth
                    variant="light"
                    color="gray"
                    className="bg-gray-100"
                    radius="sm"
                    mt="lg"
                    onClick={() => newMethod()}
                  >
                    <IconPlus size={16} />
                  </Button>
                </>
              ) : (
                <Center mt="lg">
                  <Text color="dimmed" align="center">
                    Add at least one method
                  </Text>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    className="bg-gray-100"
                    radius="xl"
                    ml="lg"
                    onClick={() => newMethod()}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Center>
              )}

              <Flex mt="xl" mb="md" align="center">
                <Text weight={500} size="sm">
                  Final Answer Preview
                </Text>
                <ActionIcon
                  variant="light"
                  color="cyan"
                  radius="xl"
                  ml="lg"
                  onClick={handleFinalAnsPreviewChange}
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Flex>
              <Box
                sx={{ flex: 1, alignSelf: "stretch" }}
                className="bg-slate-200 rounded-md border border-solid border-slate-300"
              >
                <Latex>{`$$ ${finalAnsPreview} $$`}</Latex>
              </Box>

              <Divider mt="xl" variant="dashed" />
              <Button
                fullWidth
                variant="light"
                color="cyan"
                radius="sm"
                my="xl"
                type="submit"
                onClick={() => newMethod()}
              >
                Create Question
              </Button>

              <Text size="sm" weight={500} mt="md">
                Form Data
              </Text>
              <Code block>{JSON.stringify(form.values, null, 2)}</Code>
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

// DONE
// TODO: range data for each variable
// TODO: maybe list of variables for students only
// TODO: try randomizing

// TODO: maybe have one-line descriptions for each step (optional)
// TODO: incorporate hints
// TODO: expressions validation (must have = sign)
// TODO: site responsive
// TODO: variable name rules
// TODO: random range rules / test on x cases
// TODO: circuitikz live editor
// TODO: wrong options generator / logic
// TODO: dynamic form

const qn2_data: QuestionData = {
  variables: {
    R_1: 10,
    R_2: 15,
    R_3: 20,
    R_4: 25,
    V_1: 12,
    V_2: 8,
  },
  qn_variables: ["R_1", "R_2", "R_3", "R_4", "V_1", "V_2"],
  variable_ranges: {
    R_1: { toRandomize: true, min: 1, max: 20, decimalPlaces: 0 },
    R_2: { toRandomize: true, min: 1, max: 20, decimalPlaces: 0 },
    R_3: { toRandomize: true, min: 1, max: 20, decimalPlaces: 0 },
    R_4: { toRandomize: true, min: 1, max: 20, decimalPlaces: 0 },
    V_1: { toRandomize: true, min: 1, max: 12, decimalPlaces: 0 },
    V_2: { toRandomize: true, min: 1, max: 12, decimalPlaces: 0 },
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

const circuitikz_test = `
$$
\\begin{aligned}

A(s) &= \\left( \\cfrac{\\partial r}{\\partial s} \\Delta s\\right) \\left( \\cfrac{\\partial r}{\\partial t} \\Delta t\\right) \\\\ &= \\left| \\cfrac{\\partial r}{\\partial t} \\cfrac{\\partial r}{\\partial s} \\right| dsdt = dS

\\end{aligned}
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
