import { Key, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Latex from "react-latex-next";
import { Center, Loader } from "@mantine/core";

const LoadTopic = ({
  questionDisplay,
  user,
  selectedOptions,
  setSelectedOptions,
  attempt,
  setAttempt,
  currentQuestion,
  setCurrentQuestion,
  setQuestionHistory,
}: any) => {
  const [loading, setLoading] = useState(false);

  const handleAnswerOption = (answer: string) => {
    setSelectedOptions([
      (selectedOptions[currentQuestion] = {
        answerByUser: answer,
      } as any),
    ]);
    setSelectedOptions([...selectedOptions]);

    //check if answer correct
    const data = questionDisplay[currentQuestion].question.answers;
    const result = data.filter(
      (x: { isCorrect: boolean }) => x.isCorrect === true
    );

    let correctAns;
    switch (
      selectedOptions[currentQuestion]?.answerByUser === result[0].answerContent
    ) {
      case true:
        correctAns = 1;
        break;
      case false:
        correctAns = 0;
    }
    setAttempt([
      (attempt[currentQuestion] = {
        isCorrect: correctAns,
      } as any),
    ]);
    setAttempt([...attempt]);
  };

  const handlePrevious = () => {
    const prevQues = currentQuestion - 1;
    prevQues >= 0 && setCurrentQuestion(prevQues);
  };

  const handleNext = async () => {
    if (currentQuestion in selectedOptions) {
      setQuestionHistory(
        (
          current: [
            {
              questionNumber: string;
              questionId: number;
              topicName: string;
              isCorrect: number;
            }
          ]
        ) => [
          ...current,
          {
            questionNumber: currentQuestion,
            questionId: questionDisplay[currentQuestion].question.questionId,
            topicName: questionDisplay[currentQuestion].question.questionName,
            questionDifficulty:
              questionDisplay[currentQuestion].question.questionDifficulty,
            isCorrect: attempt[currentQuestion]?.isCorrect,
          },
        ]
      );

      // logic for updating mastery for user

      //update mastery level (for both pyBKT and Mastery Table) by sending answer correctness (only can send 1, hence the map function)
      //E.g. input: {
      // "id": "c019823",
      // "skill": "Thevenin Equivalent Circuit",
      // "correct": "1"
      // }

      setLoading(true);
      console.log(loading);
      const updateMastery = async (request: {
        id: string;
        topicSlug: string;
        correct: number;
      }) => {
        try {
          //update mastery of student
          const res = await axios.post(
            "http://localhost:3000/api/pybkt/update",
            request //returns { Mastery: .... }
          ); //use data destructuring to get data from the promise object
          console.log("Res Data");
          console.log(res.data);
          return res.data;
        } catch (error) {
          console.log(error);
        }
      };

      //should output mastery skill
      const updated = await updateMastery({
        id: user[0].id,
        topicSlug: questionDisplay[currentQuestion].question.topicSlug,
        correct: attempt[currentQuestion]?.isCorrect as number,
      });
      setLoading(false);
      console.log(loading);
      console.log(user[0].id);
      console.log(questionDisplay[currentQuestion].question.topicSlug);
      console.log(attempt[currentQuestion]?.isCorrect);
      console.log(updated);
      console.log(currentQuestion);

      if (currentQuestion + 1 == questionDisplay.length) {
        console.log("reached the end");
      } else {
        //go to next page
        const nextQues = currentQuestion + 1;
        nextQues < questionDisplay.length && setCurrentQuestion(nextQues);
      }
    } else {
      alert("Please complete this question before proceeding!");
    }
  };

  return (
    <>
      {/* test functionality with User.Id and once API endpoint for Jasmine's part done */}
      {/* {questionDisplay.map(
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
      )} */}
      {loading === true ? (
        <Center style={{ height: 500 }}>
          <Loader color="cyan" size="xl" variant="oval" />
        </Center>
      ) : (
        <>
          <div className="flex w-full flex-col items-start">
            <h4 className="mt-10 text-xl text-black">
              Question {currentQuestion + 1} of {questionDisplay.length}
            </h4>
            <div className="mt-4 text-2xl text-black">
              <Latex>
                {questionDisplay[currentQuestion].question.questionContent}
              </Latex>
            </div>
          </div>
          <div className="flex w-full flex-col">
            <Image
              src={
                questionDisplay[currentQuestion].question.questionMedia[0]
                  .questionMediaURL as string
              }
              alt={
                questionDisplay[currentQuestion].question
                  .questionContent as string
              }
              width="0"
              height="0"
              sizes="100vw"
              className="h-auto w-1/2 object-contain pt-6 pb-6"
            />
          </div>
          <div className="flex w-full flex-col">
            {questionDisplay[currentQuestion].question.answers.map(
              (
                answer: { answerContent: string },
                index: Key | null | undefined
              ) => (
                <div
                  key={index}
                  className="m-2 ml-0 flex w-full cursor-pointer items-center space-x-2 rounded-xl border-2 border-white/10 bg-white/5 py-4 pl-5"
                  onClick={() => handleAnswerOption(answer.answerContent)}
                >
                  <input
                    type="radio"
                    name={answer.answerContent}
                    value={answer.answerContent}
                    checked={
                      answer.answerContent ===
                      (selectedOptions[currentQuestion]?.answerByUser as string)
                    }
                    onChange={() => handleAnswerOption(answer.answerContent)}
                    className="h-6 w-6 bg-white"
                  />
                  <Latex>{answer.answerContent}</Latex>
                </div>
              )
            )}
          </div>
          <div className="mt-4 flex w-full justify-between text-white">
            <button
              onClick={handlePrevious}
              className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
            >
              Previous
            </button>
            {currentQuestion + 1 === questionDisplay.length ? (
              <button
                onClick={handleNext}
                className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
              >
                End Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default LoadTopic;
