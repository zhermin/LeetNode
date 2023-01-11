import ProgressBar from "@/components/course/ProgressBar";
import { Paper, Text, Title } from "@mantine/core";
import { Answer, Attempt, QuestionMedia, Topic } from "@prisma/client";

const ShowResults = ({
  questionDisplay,
  attempt,
}: {
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
  attempt: { currentQuestion: number; isCorrect: boolean }[];
}) => {
  const arrScore = attempt.map((questions: { isCorrect: boolean }) =>
    questions.isCorrect ? 1 : 0
  );
  const score = arrScore.reduce((prev: number, cur: number) => prev + cur, 0);
  console.log(questionDisplay);
  const newarr = [];

  //return all question with diff topic
  let flag = 0;
  if (questionDisplay !== undefined) {
    for (let x = 0; x < questionDisplay.length; x++) {
      if (x == 0) {
        newarr.push(questionDisplay[x]);
      } else {
        for (let i = 0; i < newarr.length; i++) {
          if (
            questionDisplay !== undefined &&
            newarr[i]?.question?.topicSlug ===
              questionDisplay[x]?.question?.topicSlug
          ) {
            flag = 1;
            break;
          }
        }
        if (flag == 0) {
          newarr.push(questionDisplay[x]);
        }
        flag = 0;
      }
    }
  }

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={1} mt="md" align="center">
        Score: {score}/{questionDisplay?.length}
      </Title>
      <Text size="xl" mb="xl" align="center">
        Keep practising to achieve mastery in all topics!
      </Text>
      {newarr.map((eachProgress) => (
        <ProgressBar
          topicSlug={eachProgress?.question?.topicSlug as string}
          topicName={eachProgress?.question?.topic?.topicName as string}
          key={eachProgress?.questionId}
        />
      ))}
    </Paper>
  );
};

export default ShowResults;
