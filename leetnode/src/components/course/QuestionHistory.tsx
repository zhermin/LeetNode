import axios from "axios";
import DOMPurify from "dompurify";

import { QuestionDataType } from "@/types/question-types";
import {
  Badge,
  Center,
  createStyles,
  Flex,
  Group,
  Loader,
  Paper,
  RingProgress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  Attempt,
  Question,
  QuestionDifficulty,
  QuestionWithAddedTime,
  Topic,
} from "@prisma/client";
import { IconCheck, IconX } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

import VariablesBox from "../editor/VariablesBox";
import Latex from "../Latex";
import { QuestionDifficultyBadge } from "../misc/Badges";
import { UCQATAnswersType } from "./PracticeQuestion";

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
      >(`/api/attempts?course=${courseSlug}`),
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
      <Paper withBorder radius="lg" mr="lg" mb="lg">
        <Stack align="center" mt="sm">
          <Title order={1}>Attempt History</Title>
          <Text size="lg" color="dimmed">
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
                    <Text weight={700} size="xl" align="center">
                      {numCorrectAttempts}{" "}
                      <Text span color="dimmed">
                        / {attempts.data.length}
                      </Text>
                    </Text>
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
          mr="lg"
          mb="xl"
          key={attempt.attemptId}
        >
          <Group>
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
            className="rawhtml rawhtml-sm-img py-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                attempt.questionWithAddedTime.question.questionContent
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
