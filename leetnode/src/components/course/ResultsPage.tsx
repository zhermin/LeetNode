import ProgressBar from "@/components/course/ProgressBar";
import { Text, Title } from "@mantine/core";
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
    <>
      <div className="container mx-auto px-6 py-20 text-center">
        <Title order={1}>
          Score: {score}/{questionDisplay?.length}
        </Title>
        <Text size="xl" mb="xl">
          Keep practising to achieve mastery in all topics!
        </Text>
        {newarr.map((eachProgress) =>
          eachProgress ? (
            <ProgressBar
              topicSlug={eachProgress?.question?.topicSlug}
              topicName={eachProgress?.question?.topic?.topicName}
              key={eachProgress?.questionId}
            />
          ) : (
            <Text>Error</Text>
          )
        )}
      </div>
    </>
  );
};

export default ShowResults;
