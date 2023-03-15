import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Dispatch, Key, SetStateAction, useState } from "react";
import Latex from "react-latex-next";

import {
  Button,
  Center,
  createStyles,
  Loader,
  Paper,
  Radio,
  Text,
  Title,
} from "@mantine/core";
import {
  Answer,
  Attempt,
  Question,
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
  currentCourse
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
  attempt: {
    currentQuestion: number;
    isCorrect: boolean;
    question: Question;
  }[];
  setAttempt: Dispatch<
    SetStateAction<
      {
        currentQuestion: number;
        isCorrect: boolean;
        question: Question;
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
  currentCourse: string;
}) => {
  const { classes } = useStyles();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  // const [optionNumber, setOptionNumber] = useState<number>(0);

  let optionNumber: number;

  const handleAnswerOption = (answer: string) => {
    setSelectedOptions([
      (selectedOptions[currentQuestion] = {
        answerByUser: answer,
      }),
    ]);
    setSelectedOptions([...selectedOptions]);
    console.log(selectedOptions);

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
        question: questionDisplay?.[currentQuestion]?.question as Question,
      }),
    ]);
    setAttempt([...attempt]);
  };

  // //Previous button used for testing!
  // const handlePrevious = () => {
  //   const prevQues = currentQuestion - 1;
  //   prevQues >= 0 && setCurrentQuestion(prevQues);
  // };
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

      // Store question option number to optionNumber variable
      questionDisplay?.[currentQuestion]?.question.answers.map((options) => {
        if (
          selectedOptions[currentQuestion]?.answerByUser ===
          options.answerContent
        ) {
          optionNumber = options.optionNumber;
        }
      });

      console.log(optionNumber);

      setLoading(true);
      console.log(loading);
      //update attempt -> check attempt -> update pybkt (update mastery table) -> check mastery table

      //update attempt table in prisma
      const updateAttempts = async (request: {
        id: string;
        correct: boolean;
        optionNumber: number;
        questionId: number;
        courseSlug: string;
      }) => {
        try {
          //update mastery of student
          const res = await axios.post("/api/question/updateAttempts", request); //use data destructuring to get data from the promise object
          return res.data;
        } catch (error) {
          console.log("attempt error");
          // console.log(request);
          // console.log(error);
        }
      };
      const updatedAttempts = await updateAttempts({
        id: session?.data?.user?.id as string,
        correct: attempt[currentQuestion]?.isCorrect as boolean,
        optionNumber: optionNumber,
        questionId: questionDisplay?.[currentQuestion]?.question
          ?.questionId as number,
        courseSlug: currentCourse,
      });
      console.log(updatedAttempts);

      //checks attempt table in prisma
      const attemptCheck = async (request: {
        id: string;
        topicSlug: string;
      }) => {
        try {
          //update mastery of student
          const res = await axios.post("/api/question/checkAttempts", request); //use data destructuring to get data from the promise object
          return res.data;
        } catch (error) {
          console.log("attempt error");
        }
      };

      const checkAttempts = await attemptCheck({
        id: session?.data?.user?.id as string,
        topicSlug: questionDisplay?.[currentQuestion]?.question
          ?.topicSlug as string,
      });
      console.log(checkAttempts);
      console.log(checkAttempts.length);

      //check condition
      //correctness count last 5 to check if all wrong (need to refine)
      const topicErrorCount = checkAttempts
        .slice(-5)
        .filter(
          (item: { isCorrect: boolean }) => item.isCorrect === false
        ).length;
      console.log(topicErrorCount);

      // const wrongMeter = question;

      let masteryConditionFlag = false;
      if (topicErrorCount === 5) {
        masteryConditionFlag = true;
      }

      const updateMastery = async (request: {
        id: string;
        topicSlug: string;
        correct: boolean;
        optionNumber: number;
        questionId: number;
        masteryConditionFlag: boolean;
        courseSlug: string;
      }) => {
        try {
          //update mastery of student
          const res = await axios.post(
            "/api/pybkt/update",
            request //returns { Mastery: .... }
          ); //use data destructuring to get data from the promise object
          console.log(res.data);
          return res.data;
        } catch (error) {
          console.log("update error");
          console.log(error);
        }
      };

      //should output mastery skill
      const updated = await updateMastery({
        id: session?.data?.user?.id as string,
        topicSlug: questionDisplay?.[currentQuestion]?.question
          ?.topicSlug as string,
        correct: attempt[currentQuestion]?.isCorrect as boolean,
        optionNumber: optionNumber,
        questionId: questionDisplay?.[currentQuestion]?.question
          ?.questionId as number,
        masteryConditionFlag: masteryConditionFlag as boolean,
        courseSlug: questionDisplay?.[currentQuestion]?.courseSlug as string,
      });

      setLoading(false);
      console.log(session?.data?.user?.id);
      console.log(questionDisplay?.[currentQuestion]?.question?.topicSlug);
      console.log(attempt[currentQuestion]?.isCorrect);
      console.log(attempt[currentQuestion]?.question);
      //get the topic from here, also change to get attempts from prisma instead instead of state
      console.log(attempt[currentQuestion]?.question?.topicSlug);
      // const topicSlug = questionDisplay?.[currentQuestion]?.question?.topicSlug;
      // const topicCount = attempt.filter(
      //   (item) => item.question?.topicSlug === topicSlug
      // ).length;
      // console.log(topicCount);
      // console.log(attempt);

      console.log(optionNumber);
      console.log(questionDisplay?.[currentQuestion]?.question?.questionId);
      console.log(updated);
      console.log(currentQuestion);
      console.log(questionDisplay?.length);

      // //checks mastery table in prisma
      // const checkMastery = async (request: {
      //   id: string;
      //   topicSlug: string;
      // }) => {
      //   try {
      //     //update mastery of student
      //     const res = await axios.post("/api/question/checkMastery", request); //use data destructuring to get data from the promise object
      //     return res.data;
      //   } catch (error) {
      //     console.log("attempt error");
      //     // console.log(request);
      //     // console.log(error);
      //   }
      // };

      // const masteryCheck = await checkMastery({
      //   id: session?.data?.user?.id as string,
      //   topicSlug: questionDisplay?.[currentQuestion]?.question
      //     ?.topicSlug as string,
      // });
      // console.log(masteryCheck);

      //checks if email condition met
      // const emailCheck = async (request: {
      //   id: string;
      //   topicName: string;
      //   name: string;
      //   email: string[];
      // }) => {
      //   try {
      //     //activate email api
      //     const res = await axios.post("/api/question/sendEmail", request); //use data destructuring to get data from the promise object
      //     return res.data;
      //   } catch (error) {
      //     console.log("attempt error");
      //     // console.log(request);
      //     // console.log(error);
      //   }
      // };

      // //check if total errorMeter modulo 20
      // const errorCheck = async (request: {
      //   id: string;
      //   courseSlug: string;
      // }) => {
      //   try {
      //     //update mastery of student
      //     const res = await axios.post("/api/question/checkError", request); //use data destructuring to get data from the promise object
      //     return res.data;
      //   } catch (error) {
      //     console.log("attempt error");
      //   }
      // };

      // console.log(questionDisplay?.[currentQuestion]?.courseSlug);

      // const checkErrorAmt = await errorCheck({
      //   id: session?.data?.user?.id as string,
      //   courseSlug: questionDisplay?.[currentQuestion]?.courseSlug as string,
      // });

      // //check condition
      // if (
      //   masteryConditionFlag === true &&
      //   checkErrorAmt.errorMeter % 20 === 0 &&
      //   checkErrorAmt.errorMeter !== 0
      // ) {
      // }

      // const email = await emailCheck({
      //   id: session?.data?.user?.id as string,
      //   topicName: questionDisplay?.[currentQuestion]?.question?.topic
      //     ?.topicName as string,
      //   name: checkAttempts[0].user.name,
      //   //compile all email of ADMIN status
      //   email: maillist,
      // });
      // console.log(email);

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
            <Center className="h-[calc(100vh-180px)]">
              <Loader />
            </Center>
          ) : (
            <Paper p="xl" radius="md" withBorder>
              <Title order={1}>Question {currentQuestion + 1}</Title>
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
                className={`my-8 h-auto w-1/3 rounded-lg ${classes.image}`}
              />
              <Radio.Group orientation="vertical" size="md" mb={40}>
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
                      className={classes.options}
                      styles={{
                        label: {
                          cursor: "pointer",
                        },
                        radio: {
                          cursor: "pointer",
                        },
                      }}
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
                  Complete Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} radius="md" size="md">
                  Submit Answer
                </Button>
              )}
            </Paper>
          )}
        </>
      ) : (
        <Center className="h-[calc(100vh-180px)]">
          <Text>
            You have reached the end of this series of questions, please refer
            to the Attempts and Mastery tabs for your results and topic
            masteries.
          </Text>
        </Center>
      )}
    </>
  );
};

export default LoadTopic;

const useStyles = createStyles((theme) => ({
  image: {
    filter: theme.colorScheme === "dark" ? "invert(1)" : "none",
  },

  options: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.gray[9]
        : theme.colors.gray[0],
  },
}));
