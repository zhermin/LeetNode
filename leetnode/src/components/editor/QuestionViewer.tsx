import axios from "axios";
import DOMPurify from "dompurify";
import { useRef, useState } from "react";

import { AllQuestionsType, QuestionDataType } from "@/types/question-types";
import { CustomMath } from "@/utils/CustomMath";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  createStyles,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { QuestionDifficulty } from "@prisma/client";
import { IconEye, IconPencil } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import QuestionEditor from "./QuestionEditor";
import VariablesBox from "./VariablesBox";

export default function QuestionViewer() {
  const { classes } = useStyles();
  const editorHtml = useRef("");
  const currentQuestion = useRef<AllQuestionsType[number]>();
  const [questionAddOpened, setQuestionAddOpened] = useState(false);
  const [questionViewOpened, setQuestionViewOpened] = useState(false);
  const [questionEditOpened, setQuestionEditOpened] = useState(false);

  const { data: questions } = useQuery({
    queryKey: ["all-questions"],
    queryFn: () => axios.get<AllQuestionsType>("/api/questions"),
  });

  if (!questions) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Loader />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Center>
        <Stack align="center" mb="md">
          <Title order={2} className={classes.title} align="center">
            All Questions
          </Title>
        </Stack>
      </Center>
      <Button
        fullWidth
        variant="default"
        color="gray"
        radius="sm"
        mb="lg"
        onClick={() => {
          setQuestionAddOpened(true);
          editorHtml.current = "";
        }}
      >
        + Add New Question
      </Button>
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
              {questions.data.map((question: AllQuestionsType[number]) => (
                <tr
                  key={[question.questionId, question.variationId].toString()}
                >
                  <td>{question.questionId}</td>
                  <td>{question.variationId}</td>
                  <td>{question.questionTitle}</td>
                  <td>{question.questionDifficulty}</td>
                  <td>{question.topic.topicName}</td>
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
                    encoded: CustomMath.randomString(),
                    name: "R_1",
                    randomize: false,
                    isFinalAnswer: false,
                    unit: "\\Omega",
                    default: "10",
                  },
                  {
                    key: randomId(),
                    encoded: CustomMath.randomString(),
                    name: "R_2",
                    randomize: false,
                    isFinalAnswer: false,
                    unit: "\\Omega",
                    default: "10",
                  },
                  {
                    key: randomId(),
                    encoded: CustomMath.randomString(),
                    name: "L",
                    randomize: false,
                    isFinalAnswer: false,
                    unit: "\\text{H}",
                    default: "1",
                  },
                  {
                    key: randomId(),
                    encoded: CustomMath.randomString(),
                    name: "t",
                    randomize: false,
                    isFinalAnswer: false,
                    unit: "\\text{s}",
                    default: "0.2",
                  },
                  {
                    key: randomId(),
                    encoded: CustomMath.randomString(),
                    name: "V_{L}(t)",
                    randomize: false,
                    isFinalAnswer: true,
                    unit: "\\text{V}",
                    decimalPlaces: 3,
                    min: -90,
                    max: -10,
                    step: 7.5,
                  },
                  // {
                  //   key: randomId(),
                  //   name: "R_2",
                  //   randomize: false,
                  //   isFinalAnswer: false,
                  //   unit: "\\Omega",
                  //   default: 10,
                  // },
                  // {
                  //   key: randomId(),
                  //   name: "R_3",
                  //   randomize: false,
                  //   unit: "\\Omega",
                  //   isFinalAnswer: false,
                  //   default: 8,
                  // },
                  // {
                  //   key: randomId(),
                  //   name: "V_{\\alpha}",
                  //   randomize: true,
                  //   isFinalAnswer: false,
                  //   unit: "\\text{V}",
                  //   default: 12,
                  //   min: 1,
                  //   max: 30,
                  //   decimalPlaces: 0,
                  // },
                  // {
                  //   key: randomId(),
                  //   name: "I_3",
                  //   randomize: false,
                  //   isFinalAnswer: true,
                  //   unit: "\\text{A}",
                  //   decimalPlaces: 2,
                  // },
                  // {
                  //   key: randomId(),
                  //   name: "I_{\\text{final}}",
                  //   randomize: false,
                  //   isFinalAnswer: true,
                  //   unit: "\\text{A}",
                  //   decimalPlaces: 1,
                  // },
                ],
                methods: [
                  {
                    key: randomId(),
                    expr: "R_{eq} = (R_1 * R_2) / (R_1 + R_2)",
                    explanation: undefined,
                  },
                  {
                    key: randomId(),
                    expr: "\\tau = L / R_{eq}",
                    explanation: undefined,
                  },
                  {
                    key: randomId(),
                    expr: "V_{L}(t) = L * 1/\\tau * e^{- t / \\tau}",
                    explanation: undefined,
                  },
                  // {
                  //   key: randomId(),
                  //   expr: "I_1 = V_{\\alpha} / R_1",
                  //   explanation: undefined,
                  // },
                  // {
                  //   key: randomId(),
                  //   expr: "I_3 = V_{\\alpha} / R_3",
                  //   explanation: undefined,
                  // },
                  // {
                  //   key: randomId(),
                  //   expr: "I_2 = V_{\\alpha} / R_2",
                  //   explanation: undefined,
                  // },
                  // {
                  //   key: randomId(),
                  //   expr: "I_{\\text{final}} = (I_1 + I_2 + I_3)",
                  //   explanation: undefined,
                  // },
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
                className="rawhtml rawhtml-lg-img"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    currentQuestion.current.questionContent
                  ),
                }}
              />
              {(currentQuestion.current.questionData as QuestionDataType)
                .variables && (
                <VariablesBox
                  variables={
                    (currentQuestion.current.questionData as QuestionDataType)
                      .variables
                  }
                />
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
                currQuestionId={currentQuestion.current.questionId}
                currVariationId={currentQuestion.current.variationId}
                initialValues={{
                  baseQuestionId:
                    currentQuestion.current.variationId > 0
                      ? currentQuestion.current.questionId.toString()
                      : undefined,
                  variationId: currentQuestion.current.variationId,
                  title: currentQuestion.current.questionTitle ?? "",
                  difficulty: currentQuestion.current.questionDifficulty,
                  topic: currentQuestion.current.topicSlug,
                  ...(currentQuestion.current.questionData as QuestionDataType),
                }}
              />
            </Modal>
          )}
        </>
      ) : (
        <Text>No questions found.</Text>
      )}
    </Container>
  );
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 34,
    fontWeight: 900,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24,
    },
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
}));
