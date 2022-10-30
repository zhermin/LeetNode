import { Key } from "react";
import ProgressBar from "@/components/ProgressBar";

const ShowResults = ({ questionDisplay, attempt }: any) => {
  const arrScore = attempt.map(
    (questions: { isCorrect: number }) => questions.isCorrect
  );
  const score = arrScore.reduce((prev: number, cur: number) => prev + cur, 0);
  console.log(questionDisplay);
  const newarr = [];

  //return all question with diff topic
  let flag = 0;
  for (let x = 0; x < questionDisplay.length; x++) {
    if (x == 0) {
      newarr.push(questionDisplay[x]);
    } else {
      for (let i = 0; i < newarr.length; i++) {
        if (
          newarr[i].question.topicSlug === questionDisplay[x].question.topicSlug
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

  return (
    <>
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="mb-6 text-center text-4xl font-bold text-black">
          Score: {score}
        </h2>
        <h3 className="my-4 text-2xl text-black">
          Your mastery progress after this practice!
        </h3>
        {newarr.map(
          (eachProgress: {
            question: { topicSlug: string; topic: { topicName: string } };
            questionId: Key | null | undefined;
          }) => (
            <ProgressBar
              topicSlug={eachProgress.question.topicSlug}
              topicName={eachProgress.question.topic.topicName}
              key={eachProgress.questionId}
            />
          )
        )}
      </div>
    </>
  );
};

export default ShowResults;
