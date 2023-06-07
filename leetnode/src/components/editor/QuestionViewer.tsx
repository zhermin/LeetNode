import axios from "axios";
import DOMPurify from "dompurify";
import { DataTable } from "mantine-datatable";
import { useEffect, useMemo, useRef, useState } from "react";

import { AllQuestionsType, QuestionDataType } from "@/types/question-types";
import { CustomMath } from "@/utils/CustomMath";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  createStyles,
  Modal,
  MultiSelect,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { randomId, useDebouncedValue } from "@mantine/hooks";
import { QuestionDifficulty } from "@prisma/client";
import { IconEye, IconSearch } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import QuestionEditor from "./QuestionEditor";
import VariablesBox from "./VariablesBox";

export default function QuestionViewer() {
  const { theme, classes } = useStyles();

  const editorHtml = useRef("");
  const currentQuestion = useRef<AllQuestionsType[number]>();
  const [questionAddOpened, setQuestionAddOpened] = useState(false);
  const [questionViewOpened, setQuestionViewOpened] = useState(false);
  const [questionEditOpened, setQuestionEditOpened] = useState(false);

  const { data: questions, isFetching } = useQuery({
    queryKey: ["all-questions"],
    queryFn: () => axios.get<AllQuestionsType>("/api/question/admin"),
  });

  const topics = useMemo(() => {
    const topics = new Set(questions?.data.map((q) => q.topic.topicName));
    return [...topics];
  }, [questions?.data]);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(questions?.data.slice(0, PAGE_SIZE));

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (!questions) return;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(
      questions.data
        .filter((q) => {
          if (
            debouncedQuery !== "" &&
            !q.questionTitle
              .toLowerCase()
              .includes(debouncedQuery.trim().toLowerCase())
          ) {
            return false;
          }

          if (
            selectedTopics.length > 0 &&
            !selectedTopics.some((topic) => topic === q.topic.topicName)
          ) {
            return false;
          }

          return true;
        })
        .slice(from, to)
    );
  }, [page, questions, debouncedQuery, selectedTopics]);

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

      <DataTable
        idAccessor={({ questionId, variationId }) =>
          `${questionId}-${variationId}`
        }
        height={320}
        withBorder
        highlightOnHover
        borderRadius="sm"
        withColumnBorders
        striped
        fetching={isFetching}
        columns={[
          {
            accessor: "questionId",
            title: "ID",
            visibleMediaQuery: `(min-width: ${theme.breakpoints.xs}px)`,
          },
          {
            accessor: "variationId",
            title: "Variant",
            visibleMediaQuery: `(min-width: ${theme.breakpoints.xs}px)`,
            render: (q) =>
              `${
                q.variationId === 0
                  ? "0 (Dynamic)"
                  : q.variationId === 1
                  ? "1 (Static; Base)"
                  : `${q.variationId} (Static)`
              }`,
          },
          {
            accessor: "questionDifficulty",
            title: "Difficulty",
            width: 76,
            cellsStyle: ({ questionDifficulty }) => {
              switch (questionDifficulty) {
                case QuestionDifficulty.Easy:
                  return {
                    backgroundColor: theme.colors.green[1],
                    color:
                      theme.colorScheme === "dark" ? theme.colors.dark[8] : "",
                  };
                case QuestionDifficulty.Medium:
                  return {
                    backgroundColor: theme.colors.yellow[1],
                    color:
                      theme.colorScheme === "dark" ? theme.colors.dark[8] : "",
                  };
                case QuestionDifficulty.Hard:
                  return {
                    backgroundColor: theme.colors.red[1],
                    color:
                      theme.colorScheme === "dark" ? theme.colors.dark[8] : "",
                  };
                default:
                  return {};
              }
            },
          },
          {
            accessor: "questionTitle",
            title: "Title",
            // TODO: Filters in Mantine Datatable have a "does not recognize `getControlProps`" warning likely because our Mantine version is not updated to v6 yet due to some breaking changes
            filter: (
              <TextInput
                label="Question Search"
                placeholder="Search Question Title..."
                icon={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
            ),
            filtering: query !== "",
          },
          {
            accessor: "topic.topicName",
            title: "Topic",
            filter: (
              <MultiSelect
                label="Topics"
                description="Filter by all selected Topics"
                data={topics}
                value={selectedTopics}
                placeholder="Search Topics"
                onChange={setSelectedTopics}
                icon={<IconSearch size={16} />}
                clearable
                searchable
              />
            ),
            filtering: selectedTopics.length > 0,
          },
          {
            accessor: "actions",
            title: "",
            render: (q) => (
              <ActionIcon
                onClick={(e) => {
                  e.stopPropagation();
                  currentQuestion.current = q;
                  setQuestionViewOpened(true);
                }}
              >
                <IconEye size={16} />
              </ActionIcon>
            ),
          },
        ]}
        records={records}
        page={page}
        onPageChange={setPage}
        totalRecords={questions?.data.length}
        recordsPerPage={PAGE_SIZE}
        onRowClick={(q) => {
          editorHtml.current = q.questionContent;
          currentQuestion.current = q;
          setQuestionEditOpened(true);
        }}
      />

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
                currentQuestion.current.questionContent,
                {
                  ADD_TAGS: ["iframe"],
                  ADD_ATTR: [
                    "allow",
                    "allowfullscreen",
                    "frameborder",
                    "scrolling",
                  ],
                }
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

  modalHeader: {
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[8],
    fontWeight: 700,
  },
  modalContent: {
    maxWidth: 300,
  },
  modalLabel: { width: 80 },
}));
