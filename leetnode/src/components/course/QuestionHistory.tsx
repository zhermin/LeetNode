import {
  Badge,
  createStyles,
  Grid,
  Group,
  Paper,
  Title,
  Text,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";
import Image from "next/future/image";
import Latex from "react-latex-next";
import { QuestionDifficulty } from "@prisma/client";
import { Answer, Attempt, QuestionMedia, Topic } from "@prisma/client";

const LectureVideos = ({
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
  console.log(questionDisplay);
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
          <>
            <Paper
              radius="lg"
              withBorder
              className={`${classes.card} ${
                qns.isCorrect ? classes.correct : classes.wrong
              }`}
              mr="lg"
              mb="xl"
            >
              <Grid grow align="center">
                <Grid.Col span={7}>
                  <Group>
                    <Badge
                      color={
                        qns.questionDifficulty === QuestionDifficulty.Easy
                          ? "green"
                          : qns.questionDifficulty === QuestionDifficulty.Medium
                          ? "yellow"
                          : "red"
                      }
                      radius="lg"
                      size="lg"
                    >
                      {qns.questionDifficulty} Difficulty
                    </Badge>
                    <Badge radius="lg" size="lg">
                      {qns.topicName}
                    </Badge>
                  </Group>
                  <Title order={3} className={classes.title} my="lg">
                    Question {qns.questionNumber + 1}:{" "}
                    <Latex>{qns.questionContent}</Latex>
                  </Title>
                  {questionDisplay?.[
                    qns.questionNumber
                  ]?.question?.answers?.map(
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
                        <Text>{ans.answerContent}</Text>
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
                    className="h-auto w-full rounded-lg"
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </>
        )
      )}
    </>
  );
};

export default LectureVideos;

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
