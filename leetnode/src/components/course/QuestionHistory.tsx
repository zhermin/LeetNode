import Image from "next/image";
import Latex from "react-latex-next";

import {
  Badge,
  Center,
  createStyles,
  Grid,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import {
  Answer,
  Attempt,
  QuestionDifficulty,
  QuestionMedia,
  Topic,
} from "@prisma/client";
import { IconCheck, IconX } from "@tabler/icons";

import { QuestionDifficultyBadge } from "../misc/Badges";

const QuestionHistory = ({
  questionHistory,
  questionDisplay,
}: {
  questionHistory: {
    questionContent: string;
    questionNumber: number;
    questionMedia: string;
    topicName: string;
    questionDifficulty: QuestionDifficulty;
    isCorrect: boolean;
    answerContent: string;
  }[];
  questionDisplay:
    | {
        addedTime: Date;
        courseSlug: string;
        question: {
          answers: Answer[];
          attempts: Attempt[];
          questionContent: string;
          questionDifficulty: string;
          questionId: number;
          variationId: number;
          topicSlug: string;
          questionMedia: QuestionMedia[];
          topic: Topic;
        };
        questionId: number;
        userId: string;
      }[]
    | undefined;
}) => {
  const { classes } = useStyles();

  if (questionHistory.length === 0) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Text>You have not attempted any questions yet.</Text>
      </Center>
    );
  }

  return (
    <>
      {questionHistory.map(
        (qns: {
          questionContent: string;
          questionNumber: number;
          questionMedia: string;
          topicName: string;
          questionDifficulty: QuestionDifficulty;
          isCorrect: boolean;
          answerContent: string;
        }) => (
          <Paper
            radius="lg"
            withBorder
            className={`${classes.card} ${
              qns.isCorrect ? classes.correct : classes.wrong
            }`}
            mr="lg"
            mb="xl"
            key={qns.questionNumber}
          >
            <Grid grow align="center">
              <Grid.Col span={7}>
                <Group>
                  <QuestionDifficultyBadge
                    questionDifficulty={qns.questionDifficulty}
                    {...{ radius: "lg", size: "lg" }}
                  />
                  <Badge radius="lg" size="lg">
                    {qns.topicName}
                  </Badge>
                </Group>
                <Title order={3} className={classes.title} my="lg">
                  Question {qns.questionNumber + 1}:{" "}
                  <Latex>{qns.questionContent}</Latex>
                </Title>
                {questionDisplay?.[qns.questionNumber]?.question?.answers?.map(
                  (ans: { isCorrect: boolean; answerContent: string }) => (
                    <Group
                      key={ans.answerContent}
                      className={`${classes.options} ${
                        qns.answerContent === ans.answerContent
                          ? classes.selected
                          : ""
                      }`}
                    >
                      {ans.isCorrect === true ? (
                        <IconCheck color="green" size={30} stroke={3} />
                      ) : (
                        <IconX color="red" size={30} stroke={3} />
                      )}
                      <Latex>{ans.answerContent}</Latex>
                    </Group>
                  )
                )}
              </Grid.Col>
              <Grid.Col span={1}>
                <Image
                  src={qns.questionMedia}
                  alt={qns.questionMedia}
                  width="0"
                  height="0"
                  sizes="100vw"
                  className={`h-auto w-full rounded-lg ${classes.image}`}
                />
              </Grid.Col>
            </Grid>
          </Paper>
        )
      )}
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
    margin: theme.spacing.xs,
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
