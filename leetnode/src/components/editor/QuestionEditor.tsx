import axios from "axios";
import { evaluate } from "mathjs";
import dynamic from "next/dynamic";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import Latex from "react-latex-next";
import { z } from "zod";

import { CustomMath } from "@/server/Utils";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Code,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
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
} from "@prisma/client";
import {
  IconBulb,
  IconChecks,
  IconCode,
  IconDice3,
  IconGripVertical,
  IconHelp,
  IconMountain,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

import { CourseTypeBadge } from "../misc/Badges";
import { FormQuestionType } from "./QuestionViewer";

const Editor = dynamic(import("@/components/editor/CustomRichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

export default function QuestionEditor({
  setQuestionAddOpened,
  setQuestionEditOpened,
  editorHtml,
  questionId,
  initialValues,
}: {
  setQuestionAddOpened: Dispatch<SetStateAction<boolean>>;
  setQuestionEditOpened: Dispatch<SetStateAction<boolean>>;
  editorHtml: MutableRefObject<string>;
  questionId?: number;
  initialValues: FormQuestionType;
}) {
  const [questionType, setQuestionType] = useState(
    initialValues.variationId === 0 ? "dynamic" : "static"
  );
  const [rawDataOpened, setRawDataOpened] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

  const form = useForm({
    initialValues: initialValues,
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
                .regex(/^(?![^=$]*[=$]).*$/, {
                  message: "Equal and dollar signs not allowed",
                })
                .min(1, { message: "Cannot be empty" }),
              randomize: z.boolean(),
              isFinalAnswer: z.boolean(),
              unit: z.string().optional(),
              default: z
                .string()
                .regex(/^(?![^=$]*[=$]).*$/, {
                  message: "Equal and dollar signs not allowed",
                })
                .optional(),
              min: z.number().optional(),
              max: z.number().optional(),
              decimalPlaces: z.number().int().min(0).max(10).optional(),
              step: z.number().optional(),
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
    "\\text{Refresh to View Final Answers}"
  );
  const handlePreviewChange = (toRandomize: boolean) => {
    form.clearErrors();
    // TODO: Handle static questions

    // Replace all curly and square brackets with parentheses and remove all backslashes
    const clean = (str: string) =>
      str
        .replace(/[\[\{]/g, "(")
        .replace(/[\]\}]/g, ")")
        .replace(/[\\]/g, "");

    // Trim whitespace from the variable names
    form.values.variables.map((variable) => {
      variable.name = variable.name.trim();
    });

    // Sort and randomize variables and evalutate default values
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
        const itemName = item.encoded;
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
          [itemName]: item.default ? evaluate(clean(item.default)) : undefined,
        };
      }, {});
    evaluate("ln(x) = log(x)", rawVariables);

    // Copy all variables and encode them to ensure the expression is valid
    const formVars = [...form.values.variables];
    const encode = (str: string) => {
      formVars.sort((a, b) => b.name.length - a.name.length);
      for (const variable of formVars) {
        str = str.replaceAll(variable.name, variable.encoded);
      }
      return str;
    };

    // Evaluate all methods after encoding and cleaning them
    const invalidMessage = "\\text{Invalid Variables or Methods}";
    for (const [index, method] of form.values.methods.entries()) {
      try {
        const [lhs, rhs] = method.expr.split("=").map((s) => s.trim());
        if (!lhs || !rhs) throw new Error("Invalid Expression");
        formVars.push({
          key: randomId(),
          name: lhs,
          encoded: CustomMath.randomString(),
          randomize: false,
          isFinalAnswer: false,
        });
        console.log(`${index + 1})`, clean(encode(method.expr)));
        evaluate(clean(encode(method.expr)), rawVariables);
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
                  #{index + 1}
                </Text>
                <Code>{method.expr}</Code>
              </Text>
              <Text fz="sm">Sanitized:</Text>
              <Code>{clean(method.expr)}</Code>
            </Stack>
          ),
          {
            duration: 10000,
            className: "border border-solid border-red-500",
          }
        );
        setPreview(invalidMessage);
        setFinalAnsPreview(invalidMessage);
        return;
      }
    }

    // Display the variables and final answers in LaTeX
    try {
      if (form.values.variables.length == 0) {
        setPreview(invalidMessage);
        throw new Error("No variables specified");
      }
      setPreview(
        form.values.variables
          .filter((item) => !item.isFinalAnswer)
          .map((item) => {
            return `${item.name} ${
              item.unit ? "~(" + item.unit + ")" : ""
            } &= ${CustomMath.round(
              Number(rawVariables[item.encoded]),
              item?.decimalPlaces ?? 3
            )}`;
          })
          .join("\\\\")
      );

      const finalAnswers = form.values.variables.filter(
        (item) => item.isFinalAnswer
      );
      if (finalAnswers.length == 0) {
        setFinalAnsPreview(invalidMessage);
        throw new Error("No final answers specified");
      }
      setFinalAnsPreview(
        finalAnswers
          .map((finalAnswer) => {
            if (!finalAnswer.name || finalAnswer.decimalPlaces === undefined)
              return "\\text{Invalid Variable}";

            const finalValue = CustomMath.round(
              Number(rawVariables[finalAnswer.encoded]),
              finalAnswer.decimalPlaces
            );

            // Randomly generate incorrect answers
            if (finalAnswer.step === 0) {
              throw new Error(`Step can't be 0 for ${finalAnswer.name}`);
            }
            const incorrectRange = CustomMath.generateRange(
              (finalAnswer.min ?? -90) / 100,
              (finalAnswer.max ?? 90) / 100,
              (finalAnswer.step ?? 20) / 100
            );
            if (incorrectRange.length < 3) {
              throw new Error(
                `Not enough incorrect answers for ${finalAnswer.name}\n\nYour settings generated: [${incorrectRange}]`
              );
            }
            const incorrectAnswers = (
              CustomMath.nRandomItems(3, incorrectRange) as number[]
            ).map((val) =>
              CustomMath.round(
                finalValue * (1 + val),
                finalAnswer.decimalPlaces ??
                  CustomMath.getDecimalPlaces(finalValue)
              )
            );

            return `${finalAnswer.name} ${
              finalAnswer.unit ? "~(" + finalAnswer.unit + ")" : ""
            } &= ${finalValue} ~|~ ${incorrectAnswers.join("~|~")}`;
          })
          .join("\\\\")
      );
    } catch (e) {
      setFinalAnsPreview(invalidMessage);
      toast.error(e instanceof Error ? e.message : "Unknown Error", {
        duration: 5000,
        className: "border border-solid border-red-500",
      });
      return;
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
              <TextInput
                label="Default"
                sx={{ flex: 1 }}
                required={!form.values.variables[index]?.isFinalAnswer}
                {...form.getInputProps(`variables.${index}.default`)}
              />
            )}
            <Box
              sx={{ flex: 2, alignSelf: "stretch" }}
              className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200"
            >
              <Latex>{`$$ ${item.name ?? ""}${
                item.unit ? "~(" + item.unit + ")" : ""
              }${
                item.default !== undefined ? "=" + item.default : ""
              }$$`}</Latex>
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
                      `variables.${index}.min`,
                      item.isFinalAnswer ? undefined : -90
                    );
                    form.setFieldValue(
                      `variables.${index}.max`,
                      item.isFinalAnswer ? undefined : 90
                    );
                    form.setFieldValue(
                      `variables.${index}.step`,
                      item.isFinalAnswer ? undefined : 20
                    );
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
          {item.isFinalAnswer && (
            // TODO: 3 input fields if static question
            <Flex gap="md" align="center">
              <Text fw={500} fz="sm">
                Min % <span className="text-red-500">*</span>
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
                Max % <span className="text-red-500">*</span>
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
                % Step Size <span className="text-red-500">*</span>
              </Text>
              <NumberInput
                sx={{ flex: 1 }}
                required={item.randomize}
                precision={CustomMath.getDecimalPlaces(
                  form.values.variables[index]?.step ?? 0
                )}
                hideControls
                {...form.getInputProps(`variables.${index}.step`)}
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
      encoded: CustomMath.randomString(),
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

  const [{ data: courses }, { data: topics }] = useQueries({
    queries: [
      {
        queryKey: ["all-course-names"],
        queryFn: () => axios.get("/api/forum/getAllCourseNames"),
      },
      {
        queryKey: ["all-topic-names"],
        queryFn: () => axios.get("/api/forum/getAllTopicNames"),
      },
    ],
  });

  const useCRUDQuestion = () => {
    const queryClient = useQueryClient();
    const { mutate: addQuestion, status: addQuestionStatus } = useMutation({
      mutationFn: (
        newQuestion: Omit<Question, "questionId" | "lastModified">
      ) => axios.post("/api/questions/add", newQuestion),
      onSuccess: () => {
        queryClient.invalidateQueries(["all-questions"]);
        setQuestionAddOpened(false);
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
        setQuestionEditOpened(false);
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

  const handleCoursesBadges = (value: string | null) => {
    setFilteredCourses(
      courses?.data.filter(
        (course: {
          topics: {
            topicSlug: string;
          }[];
        }) => course.topics.some((topic) => topic.topicSlug === value)
      )
    );
  };

  useEffect(() => {
    if (questionId) {
      handleCoursesBadges(initialValues.topic);
    }
  }, [courses]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!courses || !topics) {
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

  // TODO: Able to tag question to an existing static question
  return (
    <form
      className="pr-5"
      onSubmit={form.onSubmit(
        (values: typeof form.values) => {
          if (!questionId) {
            addQuestion({
              variationId: 0,
              topicSlug: values.topic,
              questionTitle: values.title,
              questionDifficulty: values.difficulty,
              questionContent: editorHtml.current,
              questionData: {
                variables: values.variables,
                methods: values.methods,
                hints: values.hints,
              },
            });
          } else {
            editQuestion({
              questionId: questionId,
              editedQuestion: {
                lastModified: new Date(),
                variationId: values.variationId,
                topicSlug: values.topic,
                questionTitle: values.title,
                questionDifficulty: values.difficulty,
                questionContent: editorHtml.current,
                questionData: {
                  variables: values.variables,
                  methods: values.methods,
                  hints: values.hints,
                },
              },
            });
          }
        },
        (errors: typeof form.errors) => {
          Object.keys(errors).forEach((key) => {
            toast.error(errors[key] as string);
          });
        }
      )}
    >
      <SegmentedControl
        fullWidth
        mb="lg"
        value={questionType}
        onChange={setQuestionType}
        data={[
          {
            label: (
              <Tooltip.Floating
                multiline
                width={290}
                label="
                Dynamic questions are questions that can generate multiple variations of the same question using valid random variables and math expressions.
              "
              >
                <Center>
                  <IconDice3 size={18} />
                  <Box ml={10}>Dynamic Question</Box>
                </Center>
              </Tooltip.Floating>
            ),
            value: "dynamic",
          },
          {
            label: (
              <Tooltip.Floating
                multiline
                width={320}
                label="
                Static questions are questions that require everything to be user-defined. There are no variable and expression checks nor evaluations. The question is displayed as is and correctness must be ensured by the user.
              "
              >
                <Center>
                  <IconMountain size={18} />
                  <Box ml={10}>Static Question</Box>
                </Center>
              </Tooltip.Floating>
            ),
            value: "static",
          },
        ]}
      />
      <TextInput
        label="Title"
        placeholder="Short Description"
        name="title"
        required
        {...form.getInputProps("title")}
      />

      <SimpleGrid cols={2} mt="lg" breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
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
          value={form.values.topic}
          placeholder="Select key topic tested"
          label="Key Topic"
          required
          onChange={(value) => {
            form.setFieldValue("topic", value ?? "");
            handleCoursesBadges(value);
          }}
          error={form.errors.topic}
        />
      </SimpleGrid>

      <Text weight={500} size="sm" mb="xs" mt="lg">
        Topics in Courses
      </Text>
      <Flex gap="sm" wrap="wrap">
        {filteredCourses && filteredCourses.length > 0 ? (
          filteredCourses.map(
            (course: {
              courseName: string;
              courseLevel: Level;
              type: CourseType;
            }) => <CourseTypeBadge key={course.courseName} course={course} />
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
        value={editorHtml.current}
        onChange={(html) => {
          editorHtml.current = html;
        }}
      />

      <Flex mt="xl" align="center">
        <Text weight={500} size="sm">
          Variables <span className="text-red-500">*</span>
        </Text>
        <Tooltip
          multiline
          width={350}
          withArrow
          label="Complex numbers and phasors are currently not supported. Set a variable as a final answer on the right to make it part of the question's options."
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
        {questionType === "dynamic" && (
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
        )}
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
        loading={
          !questionId
            ? addQuestionStatus === "loading"
            : editQuestionStatus === "loading"
        }
      >
        {!questionId ? "Create Question" : "Save Question"}
      </Button>
      {questionId && (
        <Button
          fullWidth
          variant="light"
          color="red"
          radius="sm"
          my="xl"
          onClick={() => setConfirmDeleteOpened(true)}
        >
          Delete Question
        </Button>
      )}

      {/* Question Delete Confirmation Modal */}
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
            if (questionId) {
              deleteQuestion(questionId);
            }
            setConfirmDeleteOpened(false);
            setQuestionEditOpened(false);
          }}
        >
          Confirm Delete
        </Button>
      </Modal>

      {/* Raw Data Modal */}
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
  );
}
