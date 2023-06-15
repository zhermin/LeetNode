import axios from "axios";
import DOMPurify from "dompurify";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";

import { AllQuestionsType, QuestionDataType } from "@/types/question-types";
import { CustomMath } from "@/utils/CustomMath";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ActionIcon,
  Button,
  Container,
  createStyles,
  Divider,
  Flex,
  Modal,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { randomId, useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { QuestionDifficulty } from "@prisma/client";
import { IconEye, IconRefresh, IconSearch } from "@tabler/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import QuestionEditor from "./QuestionEditor";
import VariablesBox from "./VariablesBox";

enum QuestionDifficultyEnum {
  Easy,
  Medium,
  Hard,
}

export default function QuestionViewer() {
  const { theme, classes } = useStyles();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const queryClient = useQueryClient();

  const editorHtml = useRef("");
  const currentQuestion = useRef<AllQuestionsType[number]>();
  const [questionAddOpened, setQuestionAddOpened] = useState(false);
  const [questionViewOpened, setQuestionViewOpened] = useState(false);
  const [questionEditOpened, setQuestionEditOpened] = useState(false);

  const { data: questions, isFetching } = useQuery({
    queryKey: ["all-questions"],
    queryFn: () => axios.get<AllQuestionsType>("/api/question/admin"),
  });

  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>();
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(questions?.data.slice(0, PAGE_SIZE));
  const [totalRecords, setTotalRecords] = useState(questions?.data.length);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "questionId",
    direction: "asc",
  });

  // KIV: Mantine Datatable (v2.0.0^, and their new filters, v2.5.1^) do not work with Mantine v5. We have not updated our Mantine version to v6 yet as it will break @mantine/RTE (our custom fork of the now deprecated editor component). Hence, either change the editor or continue maintaining the custom RTE fork and migrate to v6 for both the fork and the rest of the site.
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);

  useEffect(() => {
    if (!questions) return;

    const filteredRecords = questions.data.filter((record) => {
      if (
        debouncedQuery !== "" &&
        !`${record.questionId} ${record.variationId} ${record.questionDifficulty} ${record.questionTitle} ${record.topic.topicName}`
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    const sortedRecords = filteredRecords.sort((a, b) => {
      if (sortStatus.columnAccessor === "questionId") {
        return sortStatus.direction === "asc"
          ? a.questionId - b.questionId
          : b.questionId - a.questionId;
      } else if (sortStatus.columnAccessor === "questionDifficulty") {
        return sortStatus.direction === "asc"
          ? QuestionDifficultyEnum[a.questionDifficulty] -
              QuestionDifficultyEnum[b.questionDifficulty]
          : QuestionDifficultyEnum[b.questionDifficulty] -
              QuestionDifficultyEnum[a.questionDifficulty];
      } else if (sortStatus.columnAccessor === "questionTitle") {
        return sortStatus.direction === "asc"
          ? a.questionTitle.localeCompare(b.questionTitle)
          : b.questionTitle.localeCompare(a.questionTitle);
      } else if (sortStatus.columnAccessor === "topic.topicName") {
        return sortStatus.direction === "asc"
          ? a.topic.topicName.localeCompare(b.topic.topicName)
          : b.topic.topicName.localeCompare(a.topic.topicName);
      }
      return 0;
    });

    setTotalRecords(sortedRecords.length);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(sortedRecords.slice(from, to));
  }, [page, questions, sortStatus, debouncedQuery]);

  return (
    <Container size="lg" py={!mobile ? "xl" : undefined}>
      <Title order={2} className={classes.title} align="center" mb="sm">
        All Questions
      </Title>
      <Divider
        size="md"
        w={45}
        mb="xl"
        mx="auto"
        color={theme.fn.primaryColor()}
      />

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

      <Flex mb="xs" align="center" gap="md">
        <TextInput
          placeholder="Search Question..."
          icon={<IconSearch size={16} />}
          sx={{ flex: 1 }}
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setPage(1);
          }}
        />
        <Tooltip label="Refresh Table" withArrow>
          <ActionIcon
            onClick={() => {
              queryClient.invalidateQueries(["all-questions"]);
            }}
            variant="default"
            className="rounded-full"
            disabled={isFetching}
          >
            <IconRefresh size={16} stroke={1.5} color="gray" />
          </ActionIcon>
        </Tooltip>
      </Flex>

      <DataTable
        idAccessor="questionTitle"
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
            sortable: true,
          },
          {
            accessor: "variationId",
            title: "Variant",
            visibleMediaQuery: `(min-width: ${theme.breakpoints.xs}px)`,
            render: (record) =>
              `${
                record.variationId === 0
                  ? "0 (Dynamic)"
                  : record.variationId === 1
                  ? "1 (Static; Base)"
                  : `${record.variationId} (Static)`
              }`,
          },
          {
            accessor: "questionDifficulty",
            title: "Difficulty",
            width: 76,
            sortable: true,
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
            sortable: true,
          },
          {
            accessor: "topic.topicName",
            title: "Topic",
            sortable: true,
          },
          {
            accessor: "actions",
            title: "",
            render: (record) => (
              <ActionIcon
                onClick={(e) => {
                  e.stopPropagation();
                  currentQuestion.current = record;
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
        totalRecords={totalRecords}
        recordsPerPage={PAGE_SIZE}
        onRowClick={(record) => {
          editorHtml.current = record.questionContent;
          currentQuestion.current = record;
          setQuestionEditOpened(true);
        }}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        bodyRef={bodyRef}
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
            title: "",
            difficulty: undefined,
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
