import { evaluate } from "mathjs";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Latex from "react-latex-next";
import { Document, Page } from "react-pdf";
import { z } from "zod";

import LeetNodeFooter from "@/components/Footer";
import LeetNodeHeader from "@/components/Header";
import MarkdownLatex from "@/components/MarkdownLatex";
import LeetNodeNavbar from "@/components/Navbar";
import { CustomMath } from "@/server/Utils";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
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
	NumberInput,
	ScrollArea,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Tooltip
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import {
	Icon2fa,
	IconBellRinging,
	IconCode,
	IconDatabaseImport,
	IconDice3,
	IconFileAnalytics,
	IconFingerprint,
	IconGripVertical,
	IconHelp,
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
	IconUsers,
	IconX
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
  const [rawDataOpened, setRawDataOpened] = useState(false);

  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);

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
          name: "R_2",
          randomize: false,
          isFinalAnswer: false,
          unit: "\\Omega",
          default: 10,
        },
        {
          key: randomId(),
          name: "R_3",
          unit: "\\Omega",
          default: 8,
          randomize: false,
          isFinalAnswer: false,
        },
        {
          key: randomId(),
          name: "V_{\\alpha}",
          randomize: true,
          isFinalAnswer: false,
          unit: "\\text{V}",
          default: 12,
          min: 1,
          max: 30,
          decimalPlaces: 0,
        },
        {
          key: randomId(),
          name: "I_{final}",
          randomize: false,
          isFinalAnswer: true,
          unit: "\\text{A}",
          decimalPlaces: 2,
        },
        {
          key: randomId(),
          name: "R_1",
          randomize: false,
          isFinalAnswer: false,
          unit: "\\Omega",
          default: 4,
        },
        {
          key: randomId(),
          randomize: false,
          isFinalAnswer: false,
          decimalPlaces: 0,
          name: "\\delta_{offset}",
          default: 1000,
        },
      ],
      methods: [
        {
          key: randomId(),
          expr: "I_1 = V_{\\alpha} / R_1",
        },
        {
          key: randomId(),
          expr: "I_3 = V_{\\alpha} / R_3",
        },
        {
          key: randomId(),
          expr: "I_2 = V_{\\alpha} / R_2",
        },
        {
          key: randomId(),
          expr: "I_{final} = (I_1 + I_2 + I_3) * \\delta_{offset}",
        },
      ],
    },
    validateInputOnChange: true,
    validate: zodResolver(
      z.object({
        variables: z.array(
          z.object({
            name: z
              .string()
              .trim()
              .regex(
                /^(?!mod$|to$|in$|and$|xor$|or$|not$|end$)[a-zA-Z\\][a-zA-Z\d\\{}_]*$/,
                { message: "Invalid name" }
              )
              .min(1, { message: "Cannot be empty" }),
            default: z.number(),
            min: z.number(),
            max: z.number(),
            decimalPlaces: z.number().int().min(0).max(10),
          })
        ),
        methods: z.array(
          z.object({
            expr: z
              .string()
              .trim()
              .regex(/^[^=]+=[^=]+$/, { message: "Invalid expression" })
              .min(1, { message: "Cannot be empty" }),
          })
        ),
      })
    ),
  });

  const [preview, setPreview] = useState("\\text{Refresh to View Variables}");
  const [finalAnsPreview, setFinalAnsPreview] = useState(
    "\\text{Refresh to View Final Answer}"
  );
  const handlePreviewChange = (toRandomize: boolean) => {
    const cleaned = (str: string) => str.replace(/[\\{}]/g, "");
    const rawVariables: {
      [key: string]: number;
    } = form.values.variables
      .sort((a, b) => {
        if (!a.name || !b.name) return 0;
        if (a.isFinalAnswer) return 1;
        if (b.isFinalAnswer) return -1;
        return a.name.localeCompare(b.name);
      })
      .reduce((obj, item) => {
        const itemName = cleaned(item.name);
        if (toRandomize && item.randomize) {
          return {
            ...obj,
            [itemName]: CustomMath.random(
              Number(item.min),
              Number(item.max),
              Number(item.decimalPlaces)
            ),
          };
        }
        return {
          ...obj,
          [itemName]: item.default,
        };
      }, {});

    const invalidMessage = "\\text{Invalid Variables or Methods}";
    for (const method of form.values.methods) {
      try {
        evaluate(cleaned(method.expr), rawVariables);
      } catch (e) {
        toast.error(
          (t) => (
            <Stack ml="md">
              <Flex>
                <Text fw={600} fz="sm">
                  Error: {e instanceof Error ? e.message : "Unknown Error"}
                </Text>
                <ActionIcon ml="auto" onClick={() => toast.dismiss(t.id)}>
                  <IconX size={18} />
                </ActionIcon>
              </Flex>
              <Text fz="sm">Check or reorder variables & methods in:</Text>
              <Text fz="sm">
                <Text mr="xs" span>
                  #{form.values.methods.indexOf(method) + 1}
                </Text>
                <Code>{method.expr}</Code>
              </Text>
            </Stack>
          ),
          {
            duration: 10000,
            style: {
              border: `1px solid ${theme.colors.red[5]}`,
            },
          }
        );
        setPreview(invalidMessage);
        setFinalAnsPreview(invalidMessage);
        return;
      }
    }

    const finalAnswer = form.values.variables.find(
      (item) => item.isFinalAnswer
    );
    if (finalAnswer && finalAnswer.name) {
      setFinalAnsPreview(`
        ${finalAnswer.name} ${
        finalAnswer.unit ? "~(" + finalAnswer.unit + ")" : ""
      } = ${CustomMath.round(
        Number(rawVariables[cleaned(finalAnswer.name)]),
        finalAnswer?.decimalPlaces ?? 3
      )}`);
    } else {
      setFinalAnsPreview(invalidMessage);
    }

    setPreview(
      form.values.variables
        .filter((item) => !item.isFinalAnswer)
        .map((item) => {
          return `${item.name} ${
            item.unit ? "~(" + item.unit + ")" : ""
          } &= ${CustomMath.round(
            Number(rawVariables[cleaned(item.name)]),
            item?.decimalPlaces ?? finalAnswer?.decimalPlaces ?? 3
          )}`;
        })
        .join("\\\\")
    );

    if (toRandomize) {
      toast("Randomized!", {
        icon: "🎲",
        duration: 700,
      });
    } else {
      toast.success("Preview Updated!");
    }
  };

  const varFields = form.values.variables.map((item, index) => (
    <Draggable key={item.key} index={index} draggableId={index.toString()}>
      {(provided) => (
        <Stack
          p="md"
          my="md"
          className="rounded-md odd:bg-gray-100 even:bg-gray-200"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Flex gap="md" align="center">
            <ActionIcon variant="transparent" {...provided.dragHandleProps}>
              <IconGripVertical size={18} />
            </ActionIcon>
            <TextInput
              label="Name"
              withAsterisk
              sx={{ flex: 1 }}
              {...form.getInputProps(`variables.${index}.name`)}
            />
            <TextInput
              label="Unit"
              sx={{ flex: 1 }}
              {...form.getInputProps(`variables.${index}.unit`)}
            />
            {form.values.variables[index]?.isFinalAnswer ? (
              <NumberInput
                label="Decimal Places"
                withAsterisk
                sx={{ flex: 1 }}
                {...form.getInputProps(`variables.${index}.decimalPlaces`)}
              />
            ) : (
              <NumberInput
                label="Default"
                withAsterisk
                sx={{ flex: 1 }}
                {...form.getInputProps(`variables.${index}.default`)}
              />
            )}
            <Box
              sx={{ flex: 2, alignSelf: "stretch" }}
              className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200"
            >
              <Latex>{`$$ ${item.name ?? ""}${
                item.unit ? "~(" + item.unit + ")" : ""
              }${item.default ? "=" + item.default : ""}$$`}</Latex>
            </Box>
            <Stack align="center" spacing="xs">
              <Chip
                color="red"
                disabled={
                  !item.isFinalAnswer &&
                  form.values.variables.some((item) => item.isFinalAnswer)
                }
                onClick={() => {
                  form.setFieldValue(`variables.${index}.randomize`, false);
                  form.setFieldValue(`variables.${index}.default`, undefined);
                }}
                {...form.getInputProps(`variables.${index}.isFinalAnswer`, {
                  type: "checkbox",
                })}
              >
                Final Ans
              </Chip>
              <Chip
                disabled={item.isFinalAnswer}
                {...form.getInputProps(`variables.${index}.randomize`, {
                  type: "checkbox",
                })}
              >
                Random
              </Chip>
            </Stack>
            <ActionIcon
              variant="transparent"
              onClick={() => form.removeListItem("variables", index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Flex>
          {item.randomize && !item.isFinalAnswer && (
            <Flex gap="md" align="center">
              <Text fw={500} fz="sm">
                Min <span className="text-red-500">*</span>
              </Text>
              <NumberInput
                sx={{ flex: 1 }}
                required={item.randomize}
                {...form.getInputProps(`variables.${index}.min`)}
              />
              <Text fw={500} fz="sm">
                Max <span className="text-red-500">*</span>
              </Text>
              <NumberInput
                sx={{ flex: 1 }}
                required={item.randomize}
                {...form.getInputProps(`variables.${index}.max`)}
              />
              <Text fw={500} fz="sm">
                Decimal Places <span className="text-red-500">*</span>
              </Text>
              <NumberInput
                sx={{ flex: 1 }}
                required={item.randomize}
                {...form.getInputProps(`variables.${index}.decimalPlaces`)}
              />
            </Flex>
          )}
        </Stack>
      )}
    </Draggable>
  ));

  const newVar = () => {
    form.insertListItem("variables", {
      key: randomId(),
      randomize: false,
      isFinalAnswer: false,
      name: "",
    });
  };

  const methodFields = form.values.methods.map((item, index) => (
    <Draggable key={item.key} index={index} draggableId={index.toString()}>
      {(provided) => (
        <Flex
          gap="md"
          align="center"
          p="md"
          my="md"
          className="rounded-md odd:bg-gray-100 even:bg-gray-200"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <ActionIcon variant="transparent" {...provided.dragHandleProps}>
            <IconGripVertical size={18} />
          </ActionIcon>
          <Text color="dimmed">#{index + 1}</Text>
          <TextInput
            sx={{ flex: 1 }}
            {...form.getInputProps(`methods.${index}.expr`)}
          />
          <Box
            sx={{ flex: 1, alignSelf: "stretch" }}
            className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200"
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
      )}
    </Draggable>
  ));

  const newMethod = () => {
    form.insertListItem("methods", {
      key: randomId(),
      expr: "",
    });
  };

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
                Question <span className="text-red-500">*</span>
              </Text>
              <Editor />

              <Flex mt="xl" mb="md" align="center">
                <Text weight={500} size="sm">
                  Variables <span className="text-red-500">*</span>
                </Text>
                <Tooltip
                  multiline
                  width={300}
                  withArrow
                  label="Variable names must start with an alphabet and can only contain
                alphabets, numbers, underscores and backslashes and cannot be any of the following: mod, to, in, and, xor, or, not, end."
                >
                  <ActionIcon
                    variant="transparent"
                    radius="xl"
                    ml="lg"
                    className="cursor-help"
                  >
                    <IconHelp size={20} color="black" />
                  </ActionIcon>
                </Tooltip>
              </Flex>
              {varFields.length > 0 ? (
                <>
                  <DragDropContext
                    onDragEnd={({ destination, source }) =>
                      form.reorderListItem("variables", {
                        from: source.index,
                        to: destination?.index ?? source.index,
                      })
                    }
                  >
                    <Droppable droppableId="vars-dnd" direction="vertical">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {varFields}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

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
                  <Text
                    color="dimmed"
                    align="center"
                    className="border border-gray-400"
                  >
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

              <Flex mt="xl" mb="md" align="center">
                <Text weight={500} size="sm">
                  Methods <span className="text-red-500">*</span>
                </Text>
                <Tooltip
                  multiline
                  width={300}
                  withArrow
                  label="Method expressions must have 1 and only 1 equal sign in the middle. The result from the left side will be assigned to the variable on the right side."
                >
                  <ActionIcon
                    variant="transparent"
                    radius="xl"
                    ml="lg"
                    className="cursor-help"
                  >
                    <IconHelp size={20} color="black" />
                  </ActionIcon>
                </Tooltip>
              </Flex>
              {methodFields.length > 0 ? (
                <>
                  <DragDropContext
                    onDragEnd={({ destination, source }) =>
                      form.reorderListItem("methods", {
                        from: source.index,
                        to: destination?.index ?? source.index,
                      })
                    }
                  >
                    <Droppable droppableId="methods-dnd" direction="vertical">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {methodFields}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

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
                  <Text
                    color="dimmed"
                    align="center"
                    className="border border-gray-400"
                  >
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
                  Preview
                </Text>
                <Tooltip label="Refresh" withArrow>
                  <ActionIcon
                    variant="default"
                    radius="xl"
                    ml="lg"
                    onClick={() => handlePreviewChange(false)}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Randomize" withArrow>
                  <ActionIcon
                    variant="default"
                    radius="xl"
                    ml="sm"
                    onClick={() => handlePreviewChange(true)}
                  >
                    <IconDice3 size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Raw Data" withArrow>
                  <ActionIcon
                    variant="default"
                    radius="xl"
                    ml="sm"
                    onClick={() => setRawDataOpened(true)}
                  >
                    <IconCode size={16} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
              <Box
                sx={{ flex: 1, alignSelf: "stretch" }}
                className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200"
              >
                <Latex>{`$$ \\begin{aligned} ${preview} \\end{aligned} $$`}</Latex>
              </Box>
              <Box
                mt="md"
                sx={{ flex: 1, alignSelf: "stretch" }}
                className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200"
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

              <Modal
                title="Raw Data"
                opened={rawDataOpened}
                onClose={() => setRawDataOpened(false)}
                overflow="inside"
              >
                <Prism language="json">
                  {JSON.stringify(form.values, null, 2)}
                </Prism>
              </Modal>
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
