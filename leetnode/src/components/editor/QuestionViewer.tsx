import axios from "axios";
import DOMPurify from "dompurify";
import { useRef, useState } from "react";
import Latex from "react-latex-next";

import { CustomMath } from "@/server/Utils";
import {
  ActionIcon,
  Box,
  Center,
  Group,
  Loader,
  Modal,
  Table,
  Text,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { Question, QuestionDifficulty, Topic } from "@prisma/client";
import { IconEye, IconPencil, IconPlus } from "@tabler/icons";
import { useQueries } from "@tanstack/react-query";

import QuestionEditor from "./QuestionEditor";

export type FormQuestionType = {
  variationId: number;
  title: string;
  difficulty: QuestionDifficulty;
  topic: string;
  variables: FormQuestionJsonType["variables"];
  methods: FormQuestionJsonType["methods"];
  hints: FormQuestionJsonType["hints"];
};

export type FormQuestionJsonType = {
  variables: {
    key: string;
    name: string;
    randomize: boolean;
    isFinalAnswer: boolean;
    unit?: string;
    default?: number;
    min?: number;
    max?: number;
    decimalPlaces?: number;
  }[];
  methods: {
    key: string;
    expr: string;
    explanation?: string;
  }[];
  hints: {
    key: string;
    hint: string;
  }[];
};

export default function QuestionViewer() {
  const editorHtml = useRef("");
  const currentQuestion = useRef<Question>();
  const [questionAddOpened, setQuestionAddOpened] = useState(false);
  const [questionViewOpened, setQuestionViewOpened] = useState(false);
  const [questionEditOpened, setQuestionEditOpened] = useState(false);

  const [{ data: topics }, { data: questions }] = useQueries({
    queries: [
      {
        queryKey: ["all-topic-names"],
        queryFn: () => axios.get("/api/forum/getAllTopicNames"),
      },
      {
        queryKey: ["all-questions"],
        queryFn: () => axios.get("/api/questions"),
      },
    ],
  });

  if (!topics || !questions) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Group align="center" mb="md">
        <Text weight={500} size="lg">
          All Questions
        </Text>
        <ActionIcon
          variant="default"
          color="gray"
          radius="sm"
          onClick={() => {
            setQuestionAddOpened(true);
            editorHtml.current = "";
          }}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
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
                        (topic: Topic) => topic.topicSlug === question.topicSlug
                      ).topicName
                    }
                  </td>
                  <td className="flex gap-2">
                    <ActionIcon
                      variant="default"
                      color="gray"
                      radius="sm"
                      onClick={() => {
                        currentQuestion.current = question;
                        setQuestionViewOpened(true);
                      }}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      color="gray"
                      radius="sm"
                      onClick={() => {
                        currentQuestion.current = question;
                        editorHtml.current = question.questionContent;
                        setQuestionEditOpened(true);
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Question Adder Modal */}
          <Modal
            fullScreen
            title="New Question"
            opened={questionAddOpened}
            onClose={() => setQuestionAddOpened(false)}
          >
            <QuestionEditor
              setQuestionAddOpened={setQuestionAddOpened}
              setQuestionEditOpened={setQuestionEditOpened}
              editorHtml={editorHtml}
              initialValues={{
                variationId: 0,
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
              }}
            />
          </Modal>

          {/* Question Viewer Modal */}
          {currentQuestion.current && (
            <Modal
              size="80%"
              overflow="inside"
              title="View Question"
              opened={questionViewOpened}
              onClose={() => setQuestionViewOpened(false)}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    currentQuestion.current.questionContent
                  ),
                }}
              />
              {currentQuestion.current.variationId === 0 && (
                <Box
                  sx={{ flex: 1, alignSelf: "stretch" }}
                  className="mt-5 flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200"
                >
                  <Latex>{`$$ \\begin{aligned} ${(
                    currentQuestion.current.questionData as FormQuestionJsonType
                  ).variables
                    .filter((item) => !item.isFinalAnswer)
                    .map((item) => {
                      return `${item.name} ${
                        item.unit ? "~(" + item.unit + ")" : ""
                      } &= ${CustomMath.round(
                        Number(item.default),
                        item?.decimalPlaces ??
                          CustomMath.getDecimalPlaces(item.default ?? 0)
                      )}`;
                    })
                    .join("\\\\")} \\end{aligned} $$`}</Latex>
                </Box>
              )}
            </Modal>
          )}

          {/* Question Editor Modal */}
          {currentQuestion.current && (
            <Modal
              fullScreen
              title="Edit Question"
              opened={questionEditOpened}
              onClose={() => setQuestionEditOpened(false)}
            >
              <QuestionEditor
                setQuestionAddOpened={setQuestionAddOpened}
                setQuestionEditOpened={setQuestionEditOpened}
                editorHtml={editorHtml}
                questionId={currentQuestion.current.questionId}
                initialValues={{
                  variationId: currentQuestion.current.variationId,
                  title: currentQuestion.current.questionTitle ?? "",
                  difficulty: currentQuestion.current.questionDifficulty,
                  topic: currentQuestion.current.topicSlug,
                  ...((currentQuestion.current
                    .questionData as FormQuestionJsonType) ?? {
                    variables: [],
                    methods: [],
                    hints: [],
                  }),
                }}
              />
            </Modal>
          )}
        </>
      ) : (
        <Text>No questions found.</Text>
      )}
    </>
  );
}
