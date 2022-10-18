import { Key, useState } from "react";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import ProgressBar from "@/components/ProgressBar";
import Image from "next/future/image";
import axios from "axios";
import Latex from "react-latex-next";

import { PrismaClient, Course } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export async function getStaticPaths() {
  const courses: Course[] = await prisma.course.findMany();

  const paths = courses.map((c) => ({
    params: { courseSlug: c.courseSlug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(context: any) {
  const session = await getSession(context);
  const prisma = new PrismaClient();
  console.log(context.params);

  const displayData = async (request: { courseSlug: string }) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/question/questions",
        request
      ); //use data destructuring to get data from the promise object
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  const display = await displayData(context.params);

  const questionDisplay = display.questions;

  const users = await prisma.user.findMany({
    where: {
      id: session?.user?.id,
    },
  });
  const courses = await prisma.userCourseQuestion.findMany({
    where: {
      //add in condition of what topics in this slug (although it should be the topics in this course)
      courseSlug: context.params.courseSlug,
    },
    include: {
      questions: {
        select: {
          topicSlug: true,
          questionContent: true,
        },
      },
    },
  });
  console.log(courses);
  // // return smth like
  //{
  //   id: 'cl9dkw77d0000um9goo3a3xg9',
  //   userId: 'cl99wlo0i0000umswnh90pqs6',
  //   courseSlug: 'welcome-quiz',
  //   courseCompletion: 0,
  //   questions:[
  // {
  //   topicSlug: 'voltage-division-principle',
  //   questionContent: 'For the circuit shown in the figure above, what is the voltage V1?'
  // },
  // [Object], [Object], [Object], [Object] ]
  // }

  return {
    props: {
      questionDisplay,
      user: users,
      course: courses,
    },
  };
}

export default function LoadTopic({ questionDisplay, user }: any) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    { currentQuestion: number; answerByUser: string }[]
  >([]);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerOption = (answer: string) => {
    setSelectedOptions([
      (selectedOptions[currentQuestion] = { answerByUser: answer } as never),
    ]);
    setSelectedOptions([...selectedOptions]);
  };

  const handlePrevious = () => {
    const prevQues = currentQuestion - 1;
    prevQues >= 0 && setCurrentQuestion(prevQues);
  };

  const handleNext = async () => {
    if (currentQuestion in selectedOptions) {
      // logic for updating mastery for user

      //check if answer correct
      let correctAns: string;
      const data = questionDisplay[currentQuestion].answers;
      const result = data.filter(
        (x: { isCorrect: boolean }) => x.isCorrect === true
      );
      if (
        selectedOptions[currentQuestion]?.answerByUser ===
        result[0].answerContent
      ) {
        correctAns = "1";
      } else {
        correctAns = "0";
      }

      //update mastery level by sending answer correctness (only can send 1, hence the map function)
      //E.g. input: {
      // "id": "c019823",
      // "skill": "Thevenin Equivalent Circuit",
      // "correct": "1"
      // }
      const updateMastery = async (request: {
        id: string;
        skillSlug: string;
        correct: string;
      }) => {
        try {
          //update mastery of student
          const res = await axios.post(
            "http://localhost:3000/api/pybkt/update",
            request //assume correct
          ); //use data destructuring to get data from the promise object
          return res.data;
        } catch (error) {
          console.log(error);
        }
      };

      //should output mastery skill
      const updated = await updateMastery({
        id: user[0].id,
        skillSlug: questionDisplay.topicSlug,
        correct: correctAns,
      });
      console.log(user[0].id);
      console.log(questionDisplay[currentQuestion].topicSlug);
      console.log(correctAns);
      console.log(updated);
      console.log(questionDisplay);

      //go to next page
      const nextQues = currentQuestion + 1;
      nextQues < questionDisplay.length && setCurrentQuestion(nextQues);
    } else {
      alert("Please complete this question before proceeding!");
    }
  };

  //store submit data - can be ignored for now
  const handleSubmitButton = () => {
    let newScore = 0;
    for (let i = 0; i < questionDisplay.length; i++) {
      questionDisplay[i]?.answers.map(
        (answers: {
          questionContent: string;
          optionNumber: number;
          answerContent: string;
          isCorrect: number;
        }) =>
          answers.isCorrect &&
          answers.questionContent === selectedOptions[i]?.answerByUser &&
          (newScore += 1)
      );
    }
    setScore(newScore);
    setShowScore(true);
  };

  return (
    <>
      <Navbar />
      <MainWrapper>
        {/* test functionality with User.Id and once API endpoint for Jasmine's part done */}
        {questionDisplay.map(
          (eachProgress: {
            topicSlug: string;
            topic: { topicName: string };
          }) => (
            <ProgressBar
              progressSlug={eachProgress.topicSlug}
              userId={user[0].id}
              topicName={eachProgress.topic.topicName}
              key={eachProgress.topicSlug}
            />
          )
        )}

        {/* <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1A1A1A] px-5"></div> */}
        <div className="flex w-full flex-col items-start">
          <h4 className="mt-10 text-xl text-black">
            Question {currentQuestion + 1} of {questionDisplay.length}
          </h4>
          <div className="mt-4 text-2xl text-black">
            <Latex>{questionDisplay[currentQuestion]?.questionContent}</Latex>
          </div>
        </div>
        <div className="flex w-full flex-col">
          <Image
            src={
              questionDisplay[currentQuestion]?.questionMedia[0]
                .questionMediaURL as string
            }
            alt={questionDisplay[currentQuestion]?.questionContent as string}
            width="0"
            height="0"
            sizes="100vw"
            className="h-auto w-1/2 object-contain pt-6 pb-6"
          />
        </div>
        <div className="flex w-full flex-col">
          {questionDisplay[currentQuestion]?.answers.map(
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
          <button
            onClick={
              currentQuestion + 1 === questionDisplay.length
                ? handleSubmitButton
                : handleNext
            }
            className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
          >
            {currentQuestion + 1 === questionDisplay.length ? "Submit" : "Next"}
          </button>
        </div>
      </MainWrapper>
    </>
  );
}
