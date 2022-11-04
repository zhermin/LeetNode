import { Dispatch, Key, SetStateAction, useState } from "react";
import axios from "axios";
import Image from "next/future/image";
import Latex from "react-latex-next";
import {
  createStyles,
  Center,
  Loader,
  Title,
  Text,
  Button,
  Radio,
  Paper,
} from "@mantine/core";
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
      }),
    ]);
    setAttempt([...attempt]);
  };

  // Previous button used for testing!
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

      //update mastery level (for both pyBKT and Mastery Table) by sending answer correctness (only can send 1, hence the map function)
      //E.g. input: {
      // "id": "c019823",
      // "skill": "Thevenin Equivalent Circuit",
      // "correct": "1"
      // }

      // Store quesiton option number to optionNumber variable
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
      const updateMastery = async (request: {
        id: string;
        topicSlug: string;
        correct: boolean;
        optionNumber: number;
        questionId: number;
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
        optionNumber: optionNumber,
        questionId: questionDisplay?.[currentQuestion]?.question
          ?.questionId as number,
      });

      setLoading(false);
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
