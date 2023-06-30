import axios from "axios";
import DOMPurify from "dompurify";

import { UCQATAnswersType } from "@/components/course/PracticeQuestion";
import VariablesBox from "@/components/editor/VariablesBox";
import Latex from "@/components/Latex";
import { QuestionDifficultyBadge } from "@/components/misc/Badges";
import { QuestionDataType } from "@/types/question-types";
import {
  Accordion,
  Badge,
  Box,
  Center,
  createStyles,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  RingProgress,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  Attempt,
  Question,
  QuestionDifficulty,
  QuestionWithAddedTime,
  Topic,
} from "@prisma/client";
import { IconCheck, IconHelp, IconX } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

const QuestionHistory = ({ courseSlug }: { courseSlug: string }) => {
  const { theme, classes } = useStyles();

  const { data: attempts } = useQuery({
    queryKey: ["get-attempts", courseSlug],
    queryFn: () =>
      axios.get<
        (Attempt & {
          questionWithAddedTime: QuestionWithAddedTime & {
            question: Question & {
              topic: Topic;
            };
          };
        })[]
      >(`/api/attempt?course=${courseSlug}`),
  });

  if (!attempts) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Loader />
      </Center>
    );
  }

  if (attempts.data.length === 0) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Text>You have not attempted any questions from this course yet.</Text>
      </Center>
    );
  }

  const numCorrectAttempts = attempts.data
    .map((attempt) => attempt.isCorrect)
    .filter(Boolean).length;

  // Count number of Easy, Medium, Hard questions
  const questionDifficulties = attempts.data.map(
    (attempt) => attempt.questionWithAddedTime.question.questionDifficulty
  );

  const [numEasy, numMedium, numHard] = [
    questionDifficulties.filter(
      (difficulty) => difficulty === QuestionDifficulty.Easy
    ).length,
    questionDifficulties.filter(
      (difficulty) => difficulty === QuestionDifficulty.Medium
    ).length,
    questionDifficulties.filter(
      (difficulty) => difficulty === QuestionDifficulty.Hard
    ).length,
  ];

  return (
    <>
      <Paper withBorder radius="lg" mb="lg">
        <Stack align="center" mt="sm">
          <Title order={1}>Attempt History</Title>
          <Text size="lg" color="dimmed" px="md" align="center">
            Keep practising to achieve mastery in all topics!
          </Text>
          <RingProgress
            size={220}
            thickness={15}
            roundCaps
            sections={[
              {
                value: (numEasy / attempts.data.length) * 100,
                color: theme.colors.teal[5],
                tooltip: `${numEasy} Easy`,
              },
              {
                value: (numMedium / attempts.data.length) * 100,
                color: theme.colors.yellow[5],
                tooltip: `${numMedium} Medium`,
              },
              {
                value: (numHard / attempts.data.length) * 100,
                color: theme.colors.red[5],
                tooltip: `${numHard} Hard`,
              },
            ]}
            label={
              <Center>
                <RingProgress
                  size={150}
                  thickness={15}
                  sections={[
                    {
                      value: (numCorrectAttempts / attempts.data.length) * 100,
                      color: theme.colors.green[7],
                      tooltip: `${numCorrectAttempts} Correct`,
                    },
                    {
                      value:
                        100 - (numCorrectAttempts / attempts.data.length) * 100,
                      color: theme.colors.red[7],
                      tooltip: `${
                        attempts.data.length - numCorrectAttempts
                      } Incorrect`,
                    },
                  ]}
                  label={
                    <Tooltip
                      label={`${numCorrectAttempts} Correct out of ${attempts.data.length} Total Attempts`}
                    >
                      <Text weight={700} size="xl" align="center">
                        {numCorrectAttempts}{" "}
                        <Text span color="dimmed">
                          / {attempts.data.length}
                        </Text>
                      </Text>
                    </Tooltip>
                  }
                />
              </Center>
            }
          />
        </Stack>
      </Paper>
      {attempts.data.map((attempt) => (
        <Paper
          withBorder
          radius="lg"
          className={`${classes.card} ${
            attempt.isCorrect ? classes.correct : classes.wrong
          }`}
          mb="xl"
          key={attempt.attemptId}
        >
          <Group w="70vw">
            <QuestionDifficultyBadge
              questionDifficulty={
                attempt.questionWithAddedTime.question.questionDifficulty
              }
              {...{ radius: "lg", size: "md" }}
            />
            <Badge radius="lg" size="md">
              {attempt.questionWithAddedTime.question.topic.topicName}
            </Badge>
          </Group>
          <Text className={classes.title} size="sm" mt="lg" c="dimmed">
            {new Date(attempt.submittedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </Text>
          <div
            className="rawhtml py-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                attempt.questionWithAddedTime.question.questionContent,
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
          <VariablesBox
            variables={
              attempt.questionWithAddedTime
                .variables as QuestionDataType["variables"]
            }
          />
          {(attempt.questionWithAddedTime.answers as UCQATAnswersType).map(
            (ans) => (
              <Flex
                gap="sm"
                key={ans.answerContent}
                className={`my-2 ${classes.options} ${
                  (attempt.attemptedKeys as string[]).includes(ans.key)
                    ? classes.selected
                    : ""
                }`}
              >
                {ans.isCorrect === true ? (
                  <IconCheck color="green" size={30} stroke={3} />
                ) : (
                  <IconX color="red" size={30} stroke={3} />
                )}
                {ans.isLatex ? (
                  <Latex>{`$$ ${ans.answerContent} $$`}</Latex>
                ) : (
                  <Text>{ans.answerContent}</Text>
                )}
              </Flex>
            )
          )}

          {(
            attempt.questionWithAddedTime.question
              .questionData as QuestionDataType
          ).methods && (
            <>
              <Divider my="xl" variant="dashed" />
              <Accordion variant="contained" radius="md">
                <Accordion.Item value="solution">
                  <Accordion.Control>Solution</Accordion.Control>
                  <Accordion.Panel>
                    <Stack>
                      {(
                        attempt.questionWithAddedTime.question
                          .questionData as QuestionDataType
                      ).methods.map((method, index) => (
                        <Stack
                          key={index}
                          spacing="md"
                          p="md"
                          className={
                            theme.colorScheme === "dark"
                              ? "rounded-md bg-gray-700"
                              : "rounded-md bg-gray-100"
                          }
                        >
                          <Flex gap="md" align="center">
                            <Text color="dimmed">#{index + 1}</Text>
                            <Box
                              sx={{ flex: 2, alignSelf: "stretch" }}
                              className={`flex items-center justify-center rounded-md border border-solid ${
                                theme.colorScheme === "dark"
                                  ? "border-slate-800 bg-slate-800"
                                  : "border-slate-300 bg-slate-200"
                              } py-1.5`}
                            >
                              <Latex>{`$$ ${method.expr} $$`}</Latex>
                            </Box>
                          </Flex>
                          {method.explanation !== undefined && (
                            <Flex gap="md" align="center">
                              <IconHelp stroke={1.5} size={20} />
                              <Text sx={{ flex: 1 }} fz="sm">
                                {method.explanation}
                              </Text>
                            </Flex>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </>
          )}
        </Paper>
      ))}
    </>
  );
};

export default QuestionHistory;

const useStyles = createStyles((theme) => ({
  card: {
    padding: theme.spacing.xl,
    borderLeft: `20px solid`,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : "white",
  },

  correct: {
    borderLeftColor:
      theme.colorScheme === "dark"
        ? theme.colors.teal[7]
        : theme.colors.teal[4],
  },

  wrong: {
    borderLeftColor:
      theme.colorScheme === "dark" ? theme.colors.red[7] : theme.colors.red[4],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
  },

  image: {
    filter: theme.colorScheme === "dark" ? "invert(1)" : "none",
  },

  options: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.gray[9]
        : theme.colors.gray[0],
  },

  selected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.gray[7]
        : theme.colors.gray[3],
  },
}));
