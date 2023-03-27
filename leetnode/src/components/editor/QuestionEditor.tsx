import axios from "axios";
import dynamic from "next/dynamic";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { AllQuestionsType, QuestionFormFullType } from "@/types/question-types";
import { CustomEval } from "@/utils/CustomEval";
import { CustomMath } from "@/utils/CustomMath";
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
  Topic,
} from "@prisma/client";
import {
  IconBulb,
  IconCheck,
  IconChecks,
  IconCircleX,
  IconCode,
  IconDice3,
  IconGripVertical,
  IconHelp,
  IconMathFunction,
  IconMountain,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

import Latex from "../Latex";
import { CourseTypeBadge } from "../misc/Badges";

const Editor = dynamic(import("@/components/editor/CustomRichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

type CourseNamesType = {
  type: CourseType;
  topics: Topic[];
  courseName: string;
  courseLevel: Level;
}[];

export default function QuestionEditor({
  setQuestionAddOpened,
  setQuestionEditOpened,
  editorHtml,
  currQuestionId,
  currVariationId,
  initialValues,
}: {
  setQuestionAddOpened: Dispatch<SetStateAction<boolean>>;
  setQuestionEditOpened: Dispatch<SetStateAction<boolean>>;
  editorHtml: MutableRefObject<string>;
  currQuestionId?: number;
  currVariationId?: number;
  initialValues: QuestionFormFullType;
}) {
  const [questionType, setQuestionType] = useState<"dynamic" | "static">(
    initialValues.variationId === 0 ? "dynamic" : "static"
  );
  const [rawDataOpened, setRawDataOpened] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<CourseNamesType>([]);
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
          .nonempty({ message: "Please add at least 1 variable" })
          .or(z.literal(undefined)),
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
          .nonempty({ message: "Please add at least 1 method" })
          .or(z.literal(undefined)),
        answers: z
          .array(
            z.object({
              answerContent: z
                .string()
                .min(1, { message: "Cannot be empty" })
                .max(500, { message: "Answer is too long" }),
              isCorrect: z.boolean(),
            })
          )
          .min(2, {
            message:
              "Please add at least 2 possible options for static questions",
          })
          .refine(
            (answers) => {
              const correctAnswers = answers.filter(
                (answer) => answer.isCorrect
              );
              return correctAnswers.length >= 1;
            },
            { message: "Please have at least 1 correct answer" }
          )
          .or(z.literal(undefined)),
      })
    ),
  });

  const [preview, setPreview] = useState("\\text{Refresh to View Variables}");
  const [finalAnsPreview, setFinalAnsPreview] = useState(
    "\\text{Refresh to View Final Answers}"
  );
  const invalidMessage = "\\text{Invalid Variables or Methods}";
  const handlePreviewChange = (toRandomize: boolean) => {
    form.clearErrors();
    form.validate();

    // Trim whitespaces from start/end of variable names
    form.values.variables?.map((variable) => {
      variable.name = variable.name.trim();
    });

    // If static question, skip evaluation and return early
    if (questionType === "static") {
      if (!form.values.variables || form.values.variables.length == 0) {
        setPreview("\\text{No variables specified}");
        toast(
          "No variables specified. Just make sure they are part of the question content when you are building static questions.",
          {
            duration: 5000,
            className: "border border-solid border-amber-500",
            icon: "⚠️",
          }
        );
      } else {
        setPreview(
          form.values.variables
            .filter((item) => !item.isFinalAnswer)
            .map((item) => {
              return `${item.name} ${
                item.unit ? "~(" + item.unit + ")" : ""
              } &= ${item.default}`;
            })
            .join("\\\\")
        );
        toast.success("Preview Updated!");
      }
      return;
    }

    try {
      const { questionVariables, editorAnswers } = CustomEval(
        form.values.variables,
        form.values.methods,
        toRandomize
      );

      setPreview(
        questionVariables
          .map((item) => {
            return `${item.name} ${
              item.unit ? "~(" + item.unit + ")" : ""
            } &= ${item.default}`;
          })
          .join("\\\\")
      );

      setFinalAnsPreview(
        editorAnswers
          .map((item) => {
            return `${item.name} ${
              item.unit ? "~(" + item.unit + ")" : ""
            } &= ${item.answerContent} ~|~ ${item.incorrectAnswers
              .map((ans) => ans.answerContent)
              .join("~|~")}`;
          })
          .join("\\\\")
      );
    } catch (e) {
      console.error(e);
      setPreview(invalidMessage);
      setFinalAnsPreview(invalidMessage);
      if (e instanceof Error && e.cause === "invalid-methods") {
        const error = JSON.parse(e.message) as {
          message: string;
          index: number;
          expr: string;
          sanitized: string;
          encoded: string;
        };
        toast(
          (t) => (
            <Stack ml="md" className="w-full max-w-max">
              <Flex gap="md">
                <IconCircleX
                  color="white"
                  fill="red"
                  size={40}
                  className="self-center"
                />
                <Text fw={600} fz="sm">
                  Error: {error.message}
                </Text>
                <ActionIcon ml="auto" onClick={() => toast.dismiss(t.id)}>
                  <IconX size={18} />
                </ActionIcon>
              </Flex>
              <Text fz="sm">
                Check or reorder{" "}
                <Text underline span>
                  method #{error.index}
                </Text>
              </Text>
              <Code>{error.expr}</Code>
              <Text fz="sm">Sanitized:</Text>
              <Code>{error.sanitized}</Code>
              <Text fz="sm">Encoded:</Text>
              <Code>{error.encoded}</Code>
            </Stack>
          ),
          {
            duration: 10000,
            className: "border border-solid border-red-500",
          }
        );
      } else {
        toast.error(e instanceof Error ? e.message : "Unknown Error", {
          duration: 5000,
          className: "border border-solid border-red-500",
        });
      }
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
  };

  const varFields = form.values.variables?.map((item, index) => (
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
            <Stack align="center" spacing="xs" ml={-10}>
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
                    form.setFieldValue(
                      `variables.${index}.decimalPlaces`,
                      item.isFinalAnswer ? undefined : 3
                    );
                  }}
                >
                  <IconChecks
                    size={16}
                    className={item.isFinalAnswer ? "stroke-red-600" : ""}
                  />
                </ActionIcon>
              </Tooltip>
              {questionType === "dynamic" && (
                <Tooltip label="Randomize" withArrow>
                  <ActionIcon
                    variant="default"
                    radius="xl"
                    disabled={item.isFinalAnswer}
                    className={
                      item.randomize
                        ? "border border-fuchsia-600 bg-fuchsia-50"
                        : ""
                    }
                    onClick={() => {
                      form.setFieldValue(
                        `variables.${index}.randomize`,
                        !item.randomize
                      );
                    }}
                  >
                    <IconDice3
                      size={16}
                      className={item.randomize ? "stroke-fuchsia-600" : ""}
                    />
                  </ActionIcon>
                </Tooltip>
              )}
            </Stack>
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
            {form.values.variables &&
              (!form.values.variables[index]?.isFinalAnswer ? (
                <TextInput
                  label="Default"
                  sx={{ flex: 1 }}
                  required={!form.values.variables[index]?.isFinalAnswer}
                  {...form.getInputProps(`variables.${index}.default`)}
                />
              ) : (
                questionType === "dynamic" && (
                  <NumberInput
                    label="Decimal Places"
                    sx={{ flex: 1 }}
                    required={form.values.variables[index]?.isFinalAnswer}
                    {...form.getInputProps(`variables.${index}.decimalPlaces`)}
                  />
                )
              ))}
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
            <ActionIcon
              variant="transparent"
              onClick={() => form.removeListItem("variables", index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Flex>
          {form.values.variables && item.randomize && !item.isFinalAnswer && (
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
          {form.values.variables &&
            item.isFinalAnswer &&
            questionType === "dynamic" && (
              <Flex gap="md" align="center">
                <Text fw={500} fz="sm">
                  Min % <span className="text-red-500">*</span>
                </Text>
                <NumberInput
                  sx={{ flex: 1 }}
                  required={item.isFinalAnswer}
                  precision={CustomMath.getDecimalPlaces(
                    form.values.variables[index]?.min ?? 0
                  )}
                  hideControls
                  placeholder="-90"
                  {...form.getInputProps(`variables.${index}.min`)}
                />
                <Text fw={500} fz="sm">
                  Max % <span className="text-red-500">*</span>
                </Text>
                <NumberInput
                  sx={{ flex: 1 }}
                  required={item.isFinalAnswer}
                  precision={CustomMath.getDecimalPlaces(
                    form.values.variables[index]?.max ?? 0
                  )}
                  hideControls
                  placeholder="90"
                  {...form.getInputProps(`variables.${index}.max`)}
                />
                <Text fw={500} fz="sm">
                  % Step Size <span className="text-red-500">*</span>
                </Text>
                <NumberInput
                  sx={{ flex: 1 }}
                  required={item.isFinalAnswer}
                  precision={CustomMath.getDecimalPlaces(
                    form.values.variables[index]?.step ?? 0
                  )}
                  hideControls
                  placeholder="20"
                  {...form.getInputProps(`variables.${index}.step`)}
                />
              </Flex>
            )}
        </Stack>
      )}
    </Draggable>
  ));

  const newVar = () => {
    form.values.variables = form.values.variables ?? [];
    form.insertListItem("variables", {
      key: randomId(),
      encoded: CustomMath.randomString(),
      randomize: false,
      isFinalAnswer: false,
      name: "",
    });
  };

  const methodFields = form.values.methods?.map((item, index) => (
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
              sx={{ flex: 2, alignSelf: "stretch" }}
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
                    ? "border border-amber-600 bg-amber-50"
                    : ""
                }
                onClick={() => {
                  form.setFieldValue(
                    `methods.${index}.explanation`,
                    item.explanation === undefined ? "" : undefined
                  );
                }}
              >
                <IconBulb
                  size={16}
                  className={
                    item.explanation !== undefined ? "stroke-yellow-600" : ""
                  }
                />
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

  const hintFields = form.values.hints?.map((item, index) => (
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
    form.values.hints = form.values.hints ?? [];
    form.insertListItem("hints", {
      key: randomId(),
      hint: "",
    });
  };

  const answerFields = form.values.answers?.map((item, index) => (
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
          <Stack align="center" spacing="xs" ml={-10}>
            <Tooltip label="Set Correct Answer" withArrow>
              <ActionIcon
                variant="default"
                radius="xl"
                className={
                  item.isCorrect
                    ? "border border-green-600 bg-green-50"
                    : "border border-red-600 bg-red-50"
                }
                onClick={() => {
                  form.setFieldValue(
                    `answers.${index}.isCorrect`,
                    !item.isCorrect
                  );
                }}
              >
                {item.isCorrect ? (
                  <IconCheck size={16} className="stroke-green-600" />
                ) : (
                  <IconX size={16} className="stroke-red-600" />
                )}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Display as LaTeX" withArrow>
              <ActionIcon
                variant="default"
                radius="xl"
                className={
                  item.isLatex ? "border border-sky-600 bg-sky-50" : ""
                }
                onClick={() => {
                  form.setFieldValue(`answers.${index}.isLatex`, !item.isLatex);
                }}
              >
                <IconMathFunction
                  size={16}
                  className={item.isLatex ? "stroke-sky-600" : ""}
                />
              </ActionIcon>
            </Tooltip>
          </Stack>
          <Text color="dimmed">#{index + 1}</Text>
          <Textarea
            sx={{ flex: 1 }}
            required
            {...form.getInputProps(`answers.${index}.answerContent`)}
          />
          <Box
            sx={{ flex: 1, alignSelf: "stretch" }}
            className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200 p-2"
          >
            {item.isLatex ? (
              <Latex>{`$$ ${item.answerContent} $$`}</Latex>
            ) : (
              <Text>{item.answerContent}</Text>
            )}
          </Box>
          <ActionIcon
            variant="transparent"
            onClick={() => form.removeListItem("answers", index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Flex>
      )}
    </Draggable>
  ));

  const newAnswer = () => {
    form.values.answers = form.values.answers ?? [];
    form.insertListItem("answers", {
      key: randomId(),
      answerContent: "",
      isCorrect: false,
      isLatex: false,
    });
  };

  const [{ data: questions }, { data: courses }, { data: topics }] = useQueries(
    {
      queries: [
        {
          queryKey: ["all-questions"],
          queryFn: () => axios.get<AllQuestionsType>("/api/questions"),
        },
        {
          queryKey: ["all-course-names"],
          queryFn: () =>
            axios.get<CourseNamesType>("/api/forum/getAllCourseNames"),
        },
        {
          queryKey: ["all-topic-names"],
          queryFn: () => axios.get<Topic[]>("/api/forum/getAllTopicNames"),
        },
      ],
    }
  );

  const useCRUDQuestion = () => {
    const queryClient = useQueryClient();
    const { mutate: addQuestion, status: addQuestionStatus } = useMutation({
      mutationFn: (
        newQuestion: Omit<Question, "questionId" | "lastModified"> & {
          baseQuestionId?: string | null;
        }
      ) => axios.post("/api/questions/add", newQuestion),
      onSuccess: () => {
        queryClient.invalidateQueries(["all-questions"]);
        setQuestionAddOpened(false);
        setQuestionEditOpened(false);
      },
    });

    const { mutate: editQuestion, status: editQuestionStatus } = useMutation({
      mutationFn: ({
        questionId,
        variationId,
        editedQuestion,
      }: {
        questionId: number;
        variationId: number;
        editedQuestion: Omit<
          Question,
          "questionId" | "variationId" | "lastModified"
        > & { newQuestionId?: string | null; newVariationId?: number | null };
      }) =>
        axios.put(
          `/api/questions/edit?questionId=${questionId}&variationId=${variationId}`,
          editedQuestion
        ),
      onSuccess: () => {
        queryClient.invalidateQueries(["all-questions"]);
        setQuestionEditOpened(false);
      },
    });

    const { mutate: deleteQuestion, status: deleteQuestionStatus } =
      useMutation({
        mutationFn: ({
          questionId,
          variationId,
        }: {
          questionId: number;
          variationId: number;
        }) =>
          axios.delete(
            `/api/questions/delete?questionId=${questionId}&variationId=${variationId}`
          ),
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
    if (!courses) return;
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
    if (currQuestionId) {
      handleCoursesBadges(initialValues.topic);
    }
  }, [courses]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!questions || !courses || !topics) {
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

  return (
    <form
      className="pr-5"
      onSubmit={form.onSubmit(
        (values: typeof form.values) => {
          if (currQuestionId === undefined || currVariationId === undefined) {
            addQuestion({
              baseQuestionId: values.baseQuestionId,
              variationId: questionType === "dynamic" ? 0 : values.variationId,
              topicSlug: values.topic,
              questionTitle: values.title,
              questionDifficulty: values.difficulty,
              questionContent: editorHtml.current,
              questionData: {
                variables: values.variables,
                methods: values.methods,
                hints: values.hints,
                answers: values.answers,
              },
            });
          } else {
            editQuestion({
              questionId: currQuestionId,
              variationId: currVariationId,
              editedQuestion: {
                newQuestionId: values.baseQuestionId,
                newVariationId:
                  questionType === "dynamic" ? 0 : values.variationId,
                topicSlug: values.topic,
                questionTitle: values.title,
                questionDifficulty: values.difficulty,
                questionContent: editorHtml.current,
                questionData: {
                  variables: values.variables,
                  methods: values.methods,
                  hints: values.hints,
                  answers: values.answers,
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
        onChange={(value: "dynamic" | "static") => {
          setQuestionType(value);
          if (value === "dynamic") {
            form.values.variationId = 0;
            form.values.baseQuestionId = undefined;
          } else {
            form.values.variationId = 1;
            form.values.variables?.map((_item, index) => {
              form.setFieldValue(`variables.${index}.randomize`, false);
              form.setFieldValue(`variables.${index}.min`, undefined);
              form.setFieldValue(`variables.${index}.max`, undefined);
              form.setFieldValue(`variables.${index}.step`, undefined);
              form.setFieldValue(`variables.${index}.decimalPlaces`, undefined);
            });
          }
        }}
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

      {questionType === "static" && (
        <SimpleGrid
          mb="lg"
          cols={2}
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          <Select
            clearable
            searchable
            placeholder="Leave Empty if this is a Base Question"
            label="Base Question"
            data={questions?.data
              .filter((question) => question.variationId === 1)
              .map((question) => {
                return {
                  label: `[ID#${question.questionId}] ${question.questionTitle}`,
                  value: question.questionId.toString(),
                };
              })}
            value={form.values.baseQuestionId}
            onChange={(value: string | null) => {
              form.setFieldValue("baseQuestionId", value);
              if (!value) {
                form.setFieldValue("variationId", 1);
              } else {
                const variationIds = questions?.data
                  .filter((question) => question.questionId === parseInt(value))
                  .map((question) => question.variationId);

                // Get the smallest id not already used (in case of gaps)
                const unusedVariationId = variationIds?.reduce((acc, curr) => {
                  if (curr > acc && !variationIds.includes(acc)) {
                    return acc;
                  }
                  return curr + 1;
                }, 1);
                form.setFieldValue("variationId", unusedVariationId);
              }
            }}
          />
          <NumberInput
            label="Variation ID"
            disabled
            value={form.values.variationId}
          />
        </SimpleGrid>
      )}

      <TextInput
        label="Title"
        placeholder="Short Description"
        name="title"
        mb="lg"
        required
        {...form.getInputProps("title")}
      />

      <SimpleGrid cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
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
            form.values.topic = value ?? "";
            handleCoursesBadges(value);
            form.errors.topic = undefined;
          }}
          error={form.errors.topic}
        />
      </SimpleGrid>

      <Text weight={500} size="sm" mb="xs" mt="lg">
        Topics in Courses
      </Text>
      <Flex gap="sm" wrap="wrap" mb="lg">
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

      <Text weight={500} size="sm" mb="xs">
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
          width={360}
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
          width={240}
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
      <Box className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200 pt-4 pb-2">
        <Latex>{`$$ \\begin{aligned} ${preview} \\end{aligned} $$`}</Latex>
      </Box>
      {questionType === "dynamic" && (
        <Box
          mt="md"
          className="flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200 pt-4 pb-1"
        >
          <Latex>{`$$ \\begin{aligned} ${finalAnsPreview} \\end{aligned} $$`}</Latex>
        </Box>
      )}

      {questionType === "static" && (
        <>
          <Flex mt="xl" align="center">
            <Text weight={500} size="sm">
              Answers <span className="text-red-500">*</span>
            </Text>
            <Tooltip
              withArrow
              label="At least 2 options are necessary (eg. True / False). The order doesn't matter."
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
              form.reorderListItem("answers", {
                from: source.index,
                to: destination?.index ?? source.index,
              })
            }
          >
            <Droppable droppableId="answers-dnd" direction="vertical">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {answerFields}
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
            onClick={() => newAnswer()}
          >
            <IconPlus size={16} />
          </Button>
        </>
      )}

      <Divider mt="xl" variant="dashed" />
      <Button
        fullWidth
        variant="light"
        color="cyan"
        radius="sm"
        my="xl"
        type="submit"
        loading={
          !currQuestionId && !currVariationId
            ? addQuestionStatus === "loading"
            : editQuestionStatus === "loading"
        }
        onClick={() => {
          if (questionType === "static") {
            if (!form.values.answers) {
              form.setFieldValue("answers", []);
            }
            if (form.values.variables && form.values.variables.length === 0) {
              form.setFieldValue("variables", undefined);
            }
            if (form.values.methods && form.values.methods.length === 0) {
              form.setFieldValue("methods", undefined);
            }
          } else {
            form.setFieldValue("answers", undefined);
            if (!form.values.variables) {
              form.setFieldValue("variables", []);
            }
            if (!form.values.methods) {
              form.setFieldValue("methods", []);
            }
          }
        }}
      >
        {!currQuestionId && !currVariationId
          ? "Create Question"
          : "Save Question"}
      </Button>
      {currQuestionId !== undefined && (
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
            if (currQuestionId && currVariationId) {
              deleteQuestion({
                questionId: currQuestionId,
                variationId: currVariationId,
              });
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
