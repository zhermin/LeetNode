import {
  createStyles,
  ThemeIcon,
  Text,
  Group,
  Paper,
  Image,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons";

const ICON_SIZE = 50;

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    overflow: "visible",
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 1 + ICON_SIZE / 3,
  },

  icon: {
    position: "absolute",
    top: -ICON_SIZE / 3,
    // left: `calc(50% - ${ICON_SIZE / 2}px)`,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
  },
}));

const LectureVideos = ({ questionHistory, questionDisplay }: any) => {
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
          questionDifficulty: string;
          isCorrect: number;
          answerContent: string;
        }) => (
          <>
            <Paper
              radius="md"
              withBorder
              className={classes.card}
              mt={ICON_SIZE / 3}
            >
              <ThemeIcon
                color={qns.isCorrect === 1 ? "green" : "red"}
                className={classes.icon}
                size={ICON_SIZE}
                radius={ICON_SIZE}
              >
                {qns.isCorrect === 1 ? (
                  <IconCheck size={34} stroke={1.5} />
                ) : (
                  <IconX size={34} stroke={1.5} />
                )}
              </ThemeIcon>
              <Group position="apart">
                <Group>
                  <Text weight={700} className={classes.title}>
                    Question {qns.questionNumber + 1}: {qns.questionContent}
                  </Text>
                </Group>
                <Image
                  radius="md"
                  width={300}
                  height={200}
                  fit="contain"
                  src={qns.questionMedia}
                  alt={qns.questionMedia}
                />
              </Group>
              <Text>Your Answer: {qns.answerContent}</Text>
              <SimpleGrid cols={1} verticalSpacing="xl" mt={20}>
                {questionDisplay[qns.questionNumber].question.answers.map(
                  (ans: { isCorrect: boolean; answerContent: string }) => (
                    <Group key={ans.answerContent}>
                      {ans.isCorrect === true ? <IconCheck /> : <IconX />}

                      <Text>{ans.answerContent}</Text>
                    </Group>
                  )
                )}
              </SimpleGrid>
              <Badge
                color={
                  qns.questionDifficulty === "Easy"
                    ? "green"
                    : qns.questionDifficulty === "Medium"
                    ? "indigo"
                    : "red"
                }
                radius="lg"
                size="lg"
                mt={30}
              >
                {qns.questionDifficulty} Difficulty
              </Badge>
              {/* <Text>hi</Text>
              {questionDisplay.map(
                (e: any) => {
                  <Text>{e.questionId}</Text>;
                  // e.map((ans: any) => {
                  //   <div>{ans.answerContent}</div>;
                  // });
                }

                // qns.questionContent === e.question.questionContent ? (
                //   e.answers.map((ans: { answerContent: string }) => (
                //     <div key={ans.answerContent}>{ans.answerContent}</div>
                //   ))
                // ) : (
                //   <div>error</div>
                // )
              )} */}
            </Paper>

            {/* <Paper
              radius="md"
              withBorder
              className={classes.card}
              mt={ICON_SIZE / 3}
            >
              <ThemeIcon
                className={classes.icon}
                size={ICON_SIZE}
                radius={ICON_SIZE}
              >
                <IconX size={34} stroke={1.5} />
              </ThemeIcon>

              <Text align="center" weight={700} className={classes.title}>
                Swimming challenge
              </Text>
              <Text color="dimmed" align="center" size="sm">
                32 km / week
              </Text>

              <Group position="apart" mt="xs">
                <Text size="sm" color="dimmed">
                  Progress
                </Text>
                <Text size="sm" color="dimmed">
                  62%
                </Text>
              </Group>

              <Progress value={62} mt={5} />

              <Group position="apart" mt="md">
                <Text size="sm">20 / 36 km</Text>
                <Badge size="sm">4 days left</Badge>
              </Group>
            </Paper> */}
          </>
        )
      )}
    </>
  );
};
export default LectureVideos;
