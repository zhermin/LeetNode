import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Badge,
  Center,
  createStyles,
  Grid,
  Group,
  Loader,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import {
  Answer,
  Attempt,
  Course,
  Question,
  QuestionMedia,
  Topic,
  User,
} from "@prisma/client";
import { IconCheck, IconX } from "@tabler/icons";

import Latex from "../Latex";
import { QuestionDifficultyBadge } from "../misc/Badges";

type AttemptsInterface = Attempt & {
  user: User;
  question: Question & {
    answers: Answer[];
    attempts: Attempt[];
    topic: Topic;
    questionMedia: QuestionMedia[];
  };
  answer: Answer;
  course: Course;
};

const QuestionHistory = ({ courseSlug }: { courseSlug: string }) => {
  const { classes } = useStyles();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<AttemptsInterface[]>();

  useEffect(() => {
    setLoading(true);
    axios.get("/api/prof/getAllAttempts").then((response) => {
      const dt = response.data as AttemptsInterface[];
      console.log(dt);
      setLoading(false);
      setDetails(
        dt?.filter(
          (data) =>
            data.courseSlug === courseSlug &&
            data.userId === session.data?.user?.id
        )
      );
    });
  }, [courseSlug, session.data?.user?.id]);

  console.log(session.data?.user?.id);
  console.log(courseSlug);
  console.log(details);
  if (details?.length === 0) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Text>You have not attempted any questions yet.</Text>
      </Center>
    );
  }

  return (
    <>
      {loading === true ? (
        <Center style={{ height: 500 }}>
          <Loader />
        </Center>
      ) : (
        details?.map((attempt) => (
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
            <Grid grow align="center">
              <Grid.Col span={7}>
                <Group>
                  <QuestionDifficultyBadge
                    questionDifficulty={attempt.question.questionDifficulty}
                    {...{ radius: "lg", size: "lg" }}
                  />
                  <Badge radius="lg" size="lg">
                    {attempt.question.topic.topicName}
                  </Badge>
                </Group>
                <Title order={3} className={classes.title} my="lg">
                  {/* Question {attempt.questionNumber + 1}:{" "} */}
                  <Latex>{attempt.question.questionContent}</Latex>
                </Title>
                {attempt.question.answers.map((ans) => (
                  <Group
                    key={ans.answerContent}
                    className={`${classes.options} ${
                      attempt.answer.answerContent === ans.answerContent
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
                ))}
              </Grid.Col>
              <Grid.Col span={1}>
                <Image
                  src={
                    attempt.question.questionMedia[0]
                      ?.questionMediaURL as string
                  }
                  alt={
                    attempt.question.questionMedia[0]
                      ?.questionMediaURL as string
                  }
                  width="0"
                  height="0"
                  sizes="100vw"
                  className={`h-auto w-full rounded-lg ${classes.image}`}
                />
              </Grid.Col>
            </Grid>
          </Paper>
        ))
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
