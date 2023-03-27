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
  Text,
} from "@mantine/core";
import {
  Attempt,
  Question,
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
  const { classes } = useStyles();

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

  return (
    <>
      {attempts.data.map((attempt) => (
        <Paper
          radius="lg"
          withBorder
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
