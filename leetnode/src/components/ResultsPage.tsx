import ProgressBar from "./ProgressBar";

const ShowResults = ({ questionDisplay, attempt, user }: any) => {
  console.log(user);
  const arrScore = attempt.map(
    (questions: { isCorrect: number }) => questions.isCorrect
  );
  const score = arrScore.reduce((prev: number, cur: number) => prev + cur, 0);
  return (
    <>
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="mb-6 text-center text-4xl font-bold text-black">
          Score: {score}
        </h2>
        <h3 className="my-4 text-2xl text-black">
          Your mastery progress after this practice!
        </h3>
        {questionDisplay.map(
          (eachProgress: {
            question: {
              topicSlug: string;
              topic: { topicName: string };
              questionId: number;
            };
            userId: string;
          }) => (
            <ProgressBar
              topicSlug={eachProgress.question.topicSlug}
              userId={user[0].id}
              topicName={eachProgress.question.topic.topicName}
              key={eachProgress.question.questionId}
            />
          )
        )}
      </div>
    </>
  );
};

export default ShowResults;
