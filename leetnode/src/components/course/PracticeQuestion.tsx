import { Dispatch, Key, SetStateAction, useState } from "react";
import axios from "axios";
import Image from "next/future/image";
import Latex from "react-latex-next";
import { Center, Loader, Title, Text, Button, Radio } from "@mantine/core";
import { useSession } from "next-auth/react";
import {
  Answer,
  Attempt,
  QuestionDifficulty,
  QuestionMedia,
  Topic,
} from "@prisma/client";

const LoadTopic = ({
  questionDisplay,
  selectedOptions,
  setSelectedOptions,
  attempt,
  setAttempt,
  currentQuestion,
  setCurrentQuestion,
  setQuestionHistory,
  endReached,
  setEndReached,
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
  selectedOptions: {
    answerByUser: string;
  }[];
  setSelectedOptions: Dispatch<
    SetStateAction<
      {
        answerByUser: string;
      }[]
    >
  >;
  attempt: { currentQuestion: number; isCorrect: boolean }[];
  setAttempt: Dispatch<
    SetStateAction<
      {
        currentQuestion: number;
        isCorrect: boolean;
      }[]
    >
  >;
  currentQuestion: number;
  setCurrentQuestion: Dispatch<SetStateAction<number>>;
  setQuestionHistory: Dispatch<
    SetStateAction<
      {
        questionContent: string;
        questionNumber: number;
        questionMedia: string;
        topicName: string;
        questionDifficulty: QuestionDifficulty;
        isCorrect: boolean;
        answerContent: string;
      }[]
    >
  >;
  endReached: boolean;
  setEndReached: Dispatch<SetStateAction<boolean>>;
}) => {
  const session = useSession();

  const [loading, setLoading] = useState(false);

  const handleAnswerOption = (answer: string) => {
    setSelectedOptions([
      (selectedOptions[currentQuestion] = {
        answerByUser: answer,
      }),
    ]);
    setSelectedOptions([...selectedOptions]);
    console.log(selectedOptions);
    console.log(questionDisplay);

    //check if answer correct
    const data = questionDisplay?.[currentQuestion]?.question?.answers;
    const result = data?.filter(
      (x: { isCorrect: boolean }) => x.isCorrect === true
    );

    setAttempt([
      (attempt[currentQuestion] = {
        currentQuestion: currentQuestion,
        isCorrect:
          selectedOptions[currentQuestion]?.answerByUser ===
          result?.[0]?.answerContent,
      }),
    ]);
    setAttempt([...attempt]);
  };

  // Previous button used for testing!
  // const handlePrevious = () => {
  //   const prevQues = currentQuestion - 1;
  //   prevQues >= 0 && setCurrentQuestion(prevQues);
  // };
  console.log(questionDisplay?.[currentQuestion]?.question?.topic?.topicName);
  const handleNext = async () => {
    if (currentQuestion in selectedOptions) {
      setQuestionHistory((current) => [
        ...current,
        {
          questionContent: questionDisplay?.[currentQuestion]?.question
            ?.questionContent as string,
          questionNumber: currentQuestion as number,
          questionMedia: questionDisplay?.[currentQuestion]?.question
            ?.questionMedia?.[0]?.questionMediaURL as string,
          topicName: questionDisplay?.[currentQuestion]?.question?.topic
            ?.topicName as string,
          questionDifficulty: questionDisplay?.[currentQuestion]?.question
            ?.questionDifficulty as QuestionDifficulty,
          isCorrect: attempt[currentQuestion]?.isCorrect as boolean,
          answerContent: selectedOptions?.[currentQuestion]
            ?.answerByUser as string,
        },
      ]);

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
        correct: boolean;
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
        id: session?.data?.user?.id as string,
        topicSlug: questionDisplay?.[currentQuestion]?.question
          ?.topicSlug as string,
        correct: attempt[currentQuestion]?.isCorrect as boolean,
      });
      setLoading(false);
      console.log(loading);
      console.log(session?.data?.user?.id);
      console.log(questionDisplay?.[currentQuestion]?.question?.topicSlug);
      console.log(attempt[currentQuestion]?.isCorrect);
      console.log(updated);
      console.log(currentQuestion);
      console.log(questionDisplay?.length);
      if (currentQuestion + 1 === questionDisplay?.length) {
        console.log("reached the end");
        setEndReached(true);
        console.log(endReached);
      } else if (questionDisplay) {
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
      {endReached === false ? (
        <>
          {loading === true ? (
            <Center style={{ height: 500 }}>
              <Loader />
            </Center>
          ) : (
            <>
              <Title order={1} mt="lg">
                Question {currentQuestion + 1}
              </Title>
              <Text size="xl" mt="sm">
                <Latex>
                  {
                    questionDisplay?.[currentQuestion]?.question
                      ?.questionContent
                  }
                </Latex>
              </Text>

              <Image
                src={
                  questionDisplay?.[currentQuestion]?.question?.questionMedia[0]
                    ?.questionMediaURL ?? ""
                }
                alt={
                  questionDisplay?.[currentQuestion]?.question
                    ?.questionContent ?? ""
                }
                width="0"
                height="0"
                sizes="100vw"
                className="h-auto w-1/3 rounded-lg py-8"
              />
              <Radio.Group orientation="vertical" spacing={40} mb={40}>
                {questionDisplay?.[currentQuestion]?.question?.answers?.map(
                  (
                    answer: { answerContent: string },
                    index: Key | null | undefined
                  ) => (
                    <Radio
                      key={index}
                      label={<Latex>{answer.answerContent}</Latex>}
                      value={answer.answerContent}
                      onClick={() => handleAnswerOption(answer.answerContent)}
                      checked={
                        answer.answerContent ===
                        (selectedOptions[currentQuestion]
                          ?.answerByUser as string)
                      }
                    />
                  )
                )}
              </Radio.Group>
              {/* <Button onClick={handlePrevious} radius="md" size="md">
                  Previous
                </Button> */}
              {currentQuestion + 1 === questionDisplay?.length &&
              endReached === false ? (
                <Button onClick={handleNext} radius="md" size="md">
                  Finish Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} radius="md" size="md">
                  Submit Answer
                </Button>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <Center>
            <Title mt={100}>
              End reached, please refer to the Attempts tab for your score.
            </Title>
          </Center>
        </>
      )}
    </>
  );
};

export default LoadTopic;
