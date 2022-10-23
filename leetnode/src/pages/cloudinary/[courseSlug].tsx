import { Key, useState } from "react";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import Image from "next/future/image";
import axios from "axios";
import Latex from "react-latex-next";
import Link from "next/link";

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
      url: context.params,
    },
  };
}

export default function LoadTopic({ questionDisplay, user, url }: any) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    { currentQuestion: number; answerByUser: string }[]
  >([]);
  const [attempt, setAttempt] = useState<
    { currentQuestion: number; isCorrect: number }[]
  >([]);

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
    console.log(result[0].answerContent);

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
    console.log(attempt);
  };

  const handlePrevious = () => {
    const prevQues = currentQuestion - 1;
    prevQues >= 0 && setCurrentQuestion(prevQues);
  };

  const handleNext = async () => {
    if (currentQuestion in selectedOptions) {
      // logic for updating mastery for user

      //update mastery level (for both pyBKT and Mastery Table) by sending answer correctness (only can send 1, hence the map function)
      //E.g. input: {
      // "id": "c019823",
      // "skill": "Thevenin Equivalent Circuit",
      // "correct": "1"
      // }
      const updateMastery = async (request: {
        id: string;
        skillSlug: string;
        correct: number;
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
        correct: attempt[currentQuestion]?.isCorrect as number,
      });
      console.log(user[0].id);
      console.log(questionDisplay[currentQuestion].topicSlug);
      console.log(attempt[currentQuestion]?.isCorrect);
      console.log(updated);

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
      <Header />
      <Navbar />
      <MainWrapper>
        {/* test functionality with User.Id and once API endpoint for Jasmine's part done */}
        {questionDisplay.map(
          (eachProgress: {
            topicSlug: string;
            topic: { topicName: string };
            questionId: string;
          }) => (
            <ProgressBar
              topicSlug={eachProgress.topicSlug}
              userId={user[0].id}
              topicName={eachProgress.topic.topicName}
              key={eachProgress.questionId}
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
          {currentQuestion + 1 === questionDisplay.length ? (
            <Link
              href={{
                pathname: `/cloudinary/results/[resultsPage]`,
                // query: { resultsPage: url.courseSlug },
                query: { options: JSON.stringify(attempt) },
              }}
              as={`/cloudinary/results/${url.courseSlug}`}
              key={url.courseSlug}
            >
              <button
                onClick={handleNext}
                className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
              >
                Submit
              </button>
            </Link>
          ) : (
            <button
              onClick={handleNext}
              className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
            >
              Next
            </button>
          )}
          {/* <button
              onClick={
                currentQuestion + 1 === questionDisplay.length
                  ? handleSubmitButton
                  : handleNext
              }
              className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
            >
              {currentQuestion + 1 === questionDisplay.length
                ? "Submit"
                : "Next"}
            </button>
          </Link> */}
        </div>
      </MainWrapper>
    </>
  );
}