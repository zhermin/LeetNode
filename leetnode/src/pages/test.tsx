import axios from "axios";
import DOMPurify from "dompurify";
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
  Badge,
  Box,
  Button,
  Center,
  Code,
  createStyles,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Navbar,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import {
  CourseType,
  Level,
  Question,
  QuestionDifficulty,
  Topic,
} from "@prisma/client";
import {
  Icon2fa,
  IconBellRinging,
  IconBulb,
  IconChecks,
  IconCode,
  IconDatabaseImport,
  IconDice3,
  IconEye,
  IconFileAnalytics,
  IconFingerprint,
  IconGripVertical,
  IconHelp,
  IconKey,
  IconLicense,
  IconLogout,
  IconMessage2,
  IconMessages,
  IconPencil,
  IconPlus,
  IconReceipt2,
  IconReceiptRefund,
  IconRefresh,
  IconSettings,
  IconShoppingCart,
  IconSwitchHorizontal,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

const Editor = dynamic(import("@/components/editor/Editor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

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
  const [editorHtml, setEditorHtml] = useState("");
  const [rawDataOpened, setRawDataOpened] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>();
  const [questionOpened, setQuestionOpened] = useState(false);
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

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

  // Question Generator

  const form = useForm({
    initialValues: {
      title: "Given voltage and 3 resistors, find I_3 and I_final",
      difficulty: QuestionDifficulty.Medium,
      topic: "",
      variables: [
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
          name: "R_2",
          randomize: false,
          isFinalAnswer: false,
          unit: "\\Omega",
          default: 10,
        },
        {
          key: randomId(),
          name: "R_3",
          randomize: false,
          unit: "\\Omega",
          isFinalAnswer: false,
          default: 8,
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
          name: "I_3",
          randomize: false,
          isFinalAnswer: true,
          unit: "\\text{A}",
          decimalPlaces: 2,
        },
        {
          key: randomId(),
          name: "I_{\\text{final}}",
          randomize: false,
          isFinalAnswer: true,
          unit: "\\text{A}",
          decimalPlaces: 1,
        },
      ],
      methods: [
        {
          key: randomId(),
          expr: "I_1 = V_{\\alpha} / R_1",
          explanation: undefined,
        },
        {
          key: randomId(),
          expr: "I_3 = V_{\\alpha} / R_3",
          explanation: undefined,
        },
        {
          key: randomId(),
          expr: "I_2 = V_{\\alpha} / R_2",
          explanation: undefined,
        },
        {
          key: randomId(),
          expr: "I_{\\text{final}} = (I_1 + I_2 + I_3)",
          explanation: undefined,
        },
      ],
      hints: [
        {
          key: randomId(),
          hint: "Recall that the current through a resistor can be found using Ohm's Law.",
        },
      ],
    },
    validateInputOnChange: true,
    validate: zodResolver(
      z.object({
        title: z
          .string()
          .trim()
          .min(5, { message: "Title is too short" })
          .max(150, { message: "Title is too long" }),
        topic: z.string().min(1, { message: "Please pick a topic" }),
        difficulty: z.nativeEnum(QuestionDifficulty, {
          errorMap: () => ({ message: "Please pick a difficulty" }),
        }),
        variables: z
          .array(
            z.object({
              name: z
                .string()
                .trim()
                .regex(
                  /^(?!mod$|to$|in$|and$|xor$|or$|not$|end$)[a-zA-Z\\][a-zA-Z\d\\{}_,]*$/,
                  { message: "Invalid name" }
                )
                .min(1, { message: "Cannot be empty" }),
              randomize: z.boolean(),
              isFinalAnswer: z.boolean(),
              unit: z.string().optional(),
              default: z.number().optional(),
              min: z.number().optional(),
              max: z.number().optional(),
              decimalPlaces: z.number().int().min(0).max(10).optional(),
            })
          )
          .nonempty({ message: "Please add at least 1 variable" }),
        methods: z
          .array(
            z.object({
              expr: z
                .string()
                .trim()
                .regex(/^[^=]+=[^=]+$/, { message: "Invalid expression" })
                .min(1, { message: "Cannot be empty" }),
              explanation: z
                .string()
                .min(10, {
                  message:
                    "Please provide an explanation if you have toggled Add Explanation",
                })
                .optional()
                .or(z.literal(undefined)),
            })
          )
          .nonempty({ message: "Please add at least 1 method" }),
      })
    ),
  });

  const [preview, setPreview] = useState("\\text{Refresh to View Variables}");
  const [finalAnsPreview, setFinalAnsPreview] = useState(
    "\\text{Refresh to View Final Answer}"
  );
  const handlePreviewChange = (toRandomize: boolean) => {
    form.clearErrors();
    const cleaned = (str: string) => str.replace(/[\\{},]/g, "_");
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

    const finalAnswers = form.values.variables.filter(
      (item) => item.isFinalAnswer
    );
    if (finalAnswers.length > 0) {
      setFinalAnsPreview(
        finalAnswers
          .map((finalAnswer) => {
            if (!finalAnswer.name || finalAnswer.decimalPlaces === undefined)
              return "\\text{Invalid Variable}";

            const finalValue = CustomMath.round(
              Number(rawVariables[cleaned(finalAnswer.name)]),
              finalAnswer.decimalPlaces
            );

            // randomly generate 3 incorrect answers +/- 30% to 90% (can add controls later)
            const incorrectAnswers = (
              CustomMath.nRandomItems(
                3,
                CustomMath.generateRange(0.3, 0.9, 0.2)
              ) as number[]
            ).map((val) =>
              CustomMath.round(
                finalValue * (1 + val),
                finalAnswer.decimalPlaces
              )
            );

            return `${finalAnswer.name} ${
              finalAnswer.unit ? "~(" + finalAnswer.unit + ")" : ""
            } &= ${finalValue} ~|~ ${incorrectAnswers.join("~|~")}`;
          })
          .join("\\\\")
      );
    } else {
      setFinalAnsPreview(invalidMessage);
    }

    if (form.values.variables.length > 0) {
      setPreview(
        form.values.variables
          .filter((item) => !item.isFinalAnswer)
          .map((item) => {
            return `${item.name} ${
              item.unit ? "~(" + item.unit + ")" : ""
            } &= ${CustomMath.round(
              Number(rawVariables[cleaned(item.name)]),
              item?.decimalPlaces ?? CustomMath.getDecimalPlaces(item.default)
            )}`;
          })
          .join("\\\\")
      );
    } else {
      setPreview(invalidMessage);
    }

    if (toRandomize) {
      toast("Randomized!", {
        icon: "🎲",
        duration: 700,
      });
    } else {
      toast.success("Preview Updated!");
    }
    form.validate();
  };

  const varFields = form.values.variables.map((item, index) => (
    <Draggable key={item.key} index={index} draggableId={item.key}>
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
              required
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
                sx={{ flex: 1 }}
                required={form.values.variables[index]?.isFinalAnswer}
                {...form.getInputProps(`variables.${index}.decimalPlaces`)}
              />
            ) : (
              <NumberInput
                label="Default"
                sx={{ flex: 1 }}
                required={!form.values.variables[index]?.isFinalAnswer}
                precision={CustomMath.getDecimalPlaces(
                  form.values.variables[index]?.default ?? 0
                )}
                hideControls
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
              <Tooltip label="Set Final Answer" withArrow>
                <ActionIcon
                  variant="default"
                  radius="xl"
                  className={
                    item.isFinalAnswer ? "border border-red-600 bg-red-50" : ""
                  }
                  disabled={item.randomize}
                  onClick={() => {
                    form.setFieldValue(`variables.${index}.randomize`, false);
                    form.setFieldValue(`variables.${index}.default`, undefined);
                    form.setFieldValue(
                      `variables.${index}.isFinalAnswer`,
                      !item.isFinalAnswer
                    );
                  }}
                >
                  <IconChecks size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Randomize" withArrow>
                <ActionIcon
                  variant="default"
                  radius="xl"
                  disabled={item.isFinalAnswer}
                  className={
                    item.randomize ? "border border-green-600 bg-green-50" : ""
                  }
                  onClick={() => {
                    form.setFieldValue(
                      `variables.${index}.randomize`,
                      !item.randomize
                    );
                  }}
                >
                  <IconDice3 size={16} />
                </ActionIcon>
              </Tooltip>
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
                precision={CustomMath.getDecimalPlaces(
                  form.values.variables[index]?.min ?? 0
                )}
                hideControls
                {...form.getInputProps(`variables.${index}.min`)}
              />
              <Text fw={500} fz="sm">
                Max <span className="text-red-500">*</span>
              </Text>
              <NumberInput
                sx={{ flex: 1 }}
                required={item.randomize}
                precision={CustomMath.getDecimalPlaces(
                  form.values.variables[index]?.max ?? 0
                )}
                hideControls
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
    <Draggable key={item.key} index={index} draggableId={item.key}>
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
            <Tooltip label="Add Explanation" withArrow>
              <ActionIcon
                variant="default"
                radius="xl"
                className={
                  item.explanation !== undefined
                    ? "border border-green-600 bg-green-50"
                    : ""
                }
                onClick={() => {
                  form.setFieldValue(
                    `methods.${index}.explanation`,
                    item.explanation === undefined ? "" : undefined
                  );
                }}
              >
                <IconBulb size={16} />
              </ActionIcon>
            </Tooltip>
            <ActionIcon
              variant="transparent"
              onClick={() => form.removeListItem("methods", index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Flex>
          {item.explanation !== undefined && (
            <Flex gap="md" align="center">
              <Text fw={500} fz="sm">
                Explanation <span className="text-red-500">*</span>
              </Text>
              <Textarea
                sx={{ flex: 1 }}
                required={item.explanation !== undefined}
                {...form.getInputProps(`methods.${index}.explanation`)}
              />
            </Flex>
          )}
        </Stack>
      )}
    </Draggable>
  ));

  const newMethod = () => {
    form.insertListItem("methods", {
      key: randomId(),
      expr: "",
    });
  };

  const hintFields = form.values.hints.map((item, index) => (
    <Draggable key={item.key} index={index} draggableId={item.key}>
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
          <Textarea
            sx={{ flex: 1 }}
            required
            {...form.getInputProps(`hints.${index}.hint`)}
          />
          <ActionIcon
            variant="transparent"
            onClick={() => form.removeListItem("hints", index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Flex>
      )}
    </Draggable>
  ));

  const newHint = () => {
    form.insertListItem("hints", {
      key: randomId(),
      hint: "",
    });
  };

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const [{ data: courses }, { data: topics }, { data: questions }] = useQueries(
    {
      queries: [
        {
          queryKey: ["all-course-names"],
          queryFn: () => axios.get("/api/forum/getAllCourseNames"),
        },
        {
          queryKey: ["all-topic-names"],
          queryFn: () => axios.get("/api/forum/getAllTopicNames"),
        },
        {
          queryKey: ["all-questions"],
          queryFn: () => axios.get("/api/questions"),
        },
      ],
    }
  );

  const useCRUDQuestion = () => {
    const queryClient = useQueryClient();
    const { mutate: addQuestion, status: addQuestionStatus } = useMutation({
      mutationFn: (newQuestion: Omit<Question, "questionId">) =>
        axios.post("/api/questions/add", newQuestion),
      onSuccess: () => {
        queryClient.invalidateQueries(["all-questions"]);
      },
    });

    const { mutate: editQuestion, status: editQuestionStatus } = useMutation({
      mutationFn: ({
        questionId,
        editedQuestion,
      }: {
        questionId: number;
        editedQuestion: Omit<Question, "questionId">;
      }) => axios.put(`/api/questions/edit?id=${questionId}`, editedQuestion),
      onSuccess: () => {
        queryClient.invalidateQueries(["all-questions"]);
      },
    });

    const { mutate: deleteQuestion, status: deleteQuestionStatus } =
      useMutation({
        mutationFn: (questionId: number) =>
          axios.delete(`/api/questions/delete?id=${questionId}`),
        onSuccess: () => {
          queryClient.invalidateQueries(["all-questions"]);
        },
      });

    return {
      addQuestion,
      addQuestionStatus,
      editQuestion,
      editQuestionStatus,
      deleteQuestion,
      deleteQuestionStatus,
    };
  };

  const {
    addQuestion,
    addQuestionStatus,
    editQuestion,
    editQuestionStatus,
    deleteQuestion,
    deleteQuestionStatus,
  } = useCRUDQuestion();

  console.log(editQuestion, editQuestionStatus); // TODO: Remove

  if (!courses || !topics || !questions) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  const allTopics = topics.data.map(
    (topic: { topicName: string; topicSlug: string; topicLevel: string }) => {
      return {
        label: topic.topicName,
        value: topic.topicSlug,
        group: topic.topicLevel,
      };
    }
  );

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
          <>
            <form
              onSubmit={form.onSubmit(
                (values: typeof form.values) => {
                  addQuestion({
                    variationId: 0,
                    topicSlug: values.topic,
                    questionTitle: values.title,
                    questionDifficulty: values.difficulty,
                    questionContent: editorHtml,
                    questionData: {
                      variables: values.variables,
                      methods: values.methods,
                      hints: values.hints,
                    },
                  });
                },
                (errors: typeof form.errors) => {
                  Object.keys(errors).forEach((key) => {
                    toast.error(errors[key] as string);
                  });
                }
              )}
            >
              <TextInput
                label="Title"
                placeholder="Short Description"
                name="title"
                required
                {...form.getInputProps("title")}
              />

              <SimpleGrid
                cols={2}
                mt="lg"
                breakpoints={[{ maxWidth: "sm", cols: 1 }]}
              >
                <Select
                  data={[
                    {
                      label: "Easy",
                      value: QuestionDifficulty.Easy,
                    },
                    {
                      label: "Medium",
                      value: QuestionDifficulty.Medium,
                    },
                    {
                      label: "Hard",
                      value: QuestionDifficulty.Hard,
                    },
                  ]}
                  placeholder="Select question difficulty"
                  label="Difficulty"
                  required
                  {...form.getInputProps("difficulty")}
                />
                <Select
                  data={allTopics}
                  placeholder="Select key topic tested"
                  label="Key Topic"
                  required
                  onChange={(value) => {
                    form.setFieldValue("topic", value ?? "");
                    setFilteredCourses(
                      courses.data.filter(
                        (course: {
                          topics: {
                            topicSlug: string;
                          }[];
                        }) =>
                          course.topics.some(
                            (topic) => topic.topicSlug === value
                          )
                      )
                    );
                  }}
                  error={form.errors.topic}
                />
              </SimpleGrid>

              <Text weight={500} size="sm" mb="xs" mt="lg">
                Topics in Courses
              </Text>
              <Flex gap="sm" wrap="wrap">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map(
                    (course: {
                      courseName: string;
                      courseLevel: Level;
                      type: CourseType;
                    }) => (
                      <Badge
                        key={course.courseName}
                        color={
                          course.type === CourseType.Content
                            ? course.courseLevel === Level.Foundational
                              ? "green"
                              : course.courseLevel === Level.Intermediate
                              ? "yellow"
                              : "red"
                            : ""
                        }
                      >
                        {course.courseName}
                      </Badge>
                    )
                  )
                ) : (
                  <Badge color="dark">None</Badge>
                )}
              </Flex>

              <Text weight={500} size="sm" mb="xs" mt="lg">
                Question <span className="text-red-500">*</span>
              </Text>
              <Editor
                upload_preset="question_media"
                value={editorHtml}
                onChange={setEditorHtml}
              />

              <Flex mt="xl" align="center">
                <Text weight={500} size="sm">
                  Variables <span className="text-red-500">*</span>
                </Text>
                <Tooltip
                  multiline
                  width={350}
                  withArrow
                  label="Variable names must start with an alphabet and can only contain
                alphabets, numbers, underscores, commas and backslashes and cannot be any of the following: mod, to, in, and, xor, or, not, end. Dollar signs ($) are disabled as they clash with LaTeX."
                >
                  <ActionIcon
                    variant="transparent"
                    radius="xl"
                    ml="lg"
                    className="cursor"
                    component="a"
                    href="https://mathjs.org/docs/expressions/syntax.html#constants-and-variables"
                    target="_blank"
                  >
                    <IconHelp size={20} color="black" />
                  </ActionIcon>
                </Tooltip>
              </Flex>
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
                    <div {...provided.droppableProps} ref={provided.innerRef}>
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
                mt="md"
                onClick={() => newVar()}
              >
                <IconPlus size={16} />
              </Button>

              <Flex mt="xl" align="center">
                <Text weight={500} size="sm">
                  Methods <span className="text-red-500">*</span>
                </Text>
                <Tooltip
                  multiline
                  width={350}
                  withArrow
                  label="Expressions must have 1 and only 1 equal sign in the middle. The result from the left side will be assigned to the variable on the right side. Explanations will only be shown after attempting the question."
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
                    <div {...provided.droppableProps} ref={provided.innerRef}>
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
                mt="md"
                onClick={() => newMethod()}
              >
                <IconPlus size={16} />
              </Button>

              <Flex mt="xl" align="center">
                <Text weight={500} size="sm">
                  Hints
                </Text>
                <Tooltip
                  multiline
                  width={350}
                  withArrow
                  label="Hints are optional and can be seen when attempting the question."
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
              <DragDropContext
                onDragEnd={({ destination, source }) =>
                  form.reorderListItem("hints", {
                    from: source.index,
                    to: destination?.index ?? source.index,
                  })
                }
              >
                <Droppable droppableId="hints-dnd" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {hintFields}
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
                mt="md"
                onClick={() => newHint()}
              >
                <IconPlus size={16} />
              </Button>

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
                <Latex>{`$$ \\begin{aligned} ${finalAnsPreview} \\end{aligned} $$`}</Latex>
              </Box>

              <Divider mt="xl" variant="dashed" />
              <Button
                fullWidth
                variant="light"
                color="cyan"
                radius="sm"
                my="xl"
                type="submit"
                loading={addQuestionStatus === "loading"}
              >
                Create Question
              </Button>

              <Modal
                size="xl"
                title="Raw Data"
                opened={rawDataOpened}
                onClose={() => setRawDataOpened(false)}
                overflow="inside"
              >
                <Prism language="json" withLineNumbers>
                  {JSON.stringify(form.values, null, 2)}
                </Prism>
              </Modal>
            </form>
          </>
        ) : active === "Questions" ? (
          <>
            <Text weight={500} size="lg" mb="md">
              All Questions
            </Text>
            {questions.data.length > 0 ? (
              <>
                <Table highlightOnHover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Variation</th>
                      <th>Title</th>
                      <th>Difficulty</th>
                      <th>Topic</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.data.map((question: Question) => (
                      <tr key={question.questionId}>
                        <td>{question.questionId}</td>
                        <td>{question.variationId}</td>
                        <td>{question.questionTitle}</td>
                        <td>{question.questionDifficulty}</td>
                        <td>
                          {
                            topics.data.find(
                              (topic: Topic) =>
                                topic.topicSlug === question.topicSlug
                            ).topicName
                          }
                        </td>
                        <td className="flex gap-2">
                          <ActionIcon
                            variant="default"
                            color="gray"
                            radius="sm"
                            onClick={() => {
                              setCurrentQuestion(question);
                              setQuestionOpened(true);
                            }}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="default"
                            color="gray"
                            radius="sm"
                            onClick={() => {
                              setCurrentQuestion(question);
                              setQuestionOpened(true);
                            }}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="default"
                            color="gray"
                            radius="sm"
                            onClick={() => {
                              setCurrentQuestion(question);
                              setConfirmDeleteOpened(true);
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Modal
                  size="xl"
                  title="Question"
                  opened={questionOpened}
                  onClose={() => setQuestionOpened(false)}
                  overflow="inside"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        currentQuestion?.questionContent ?? ""
                      ),
                    }}
                  />
                  <Prism language="json" mt="xl" withLineNumbers>
                    {JSON.stringify(currentQuestion, null, 2)}
                  </Prism>
                </Modal>
                <Modal
                  opened={confirmDeleteOpened}
                  onClose={() => setConfirmDeleteOpened(false)}
                  size="auto"
                  withCloseButton={false}
                  centered
                >
                  <Group position="apart" align="center" mb="lg">
                    <Text weight={500} size="lg">
                      Are you sure you want to delete this question?
                    </Text>
                    <ActionIcon
                      variant="transparent"
                      color="gray"
                      radius="sm"
                      onClick={() => setConfirmDeleteOpened(false)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                  <Button
                    fullWidth
                    variant="light"
                    color="red"
                    radius="sm"
                    type="submit"
                    loading={deleteQuestionStatus === "loading"}
                    onClick={() => {
                      if (currentQuestion) {
                        deleteQuestion(currentQuestion.questionId);
                        setConfirmDeleteOpened(false);
                      }
                    }}
                  >
                    Confirm Delete
                  </Button>
                </Modal>
              </>
            ) : (
              <Text>No questions found.</Text>
            )}
          </>
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
