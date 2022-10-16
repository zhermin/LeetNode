import { Key, useState } from "react";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import ProgressBar from "@/components/ProgressBar";
import Image from "next/future/image";
import axios from "axios";
import Latex from "react-latex-next";

import { PrismaClient, Course } from "@prisma/client";

const prisma = new PrismaClient();

interface displayProp {
  questionId: string;
  topicId: string;
  questionContent: string;
  questionDifficulty: string;
  questionMedia: object;
  topic: {
    topicId: string;
    topicName: string;
    topicLevel: string;
  };
  attempts: object;
  answers: object;
}

export async function getStaticPaths() {
  const courses: Course[] = await prisma.course.findMany();

  const paths = courses.map((c) => ({
    params: { courseSlug: c.courseSlug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(context: any) {
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

  const users = await prisma.user.findMany();
  const topics = await prisma.topic.findMany({
    where: {
      //add in condition of what topics in this slug (although it should be the topics in this course)
      topicSlug: context.params.courseSlug,
    },
  });
  console.log(topics);
  return {
    props: {
      display,
      user: users,
      topic: topics,
    },
  };
}

export default function LoadTopic({ display, user, topic }: any) {
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
      const data = display[currentQuestion].answers;
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
      //change to topics of the course
      topic.map(
        async (e: {
          topicSlug: string;
          topicName: string;
          topicLevel: string;
        }) => {
          await updateMastery({
            id: user.Id, //CONFIGURE USER ID
            skillSlug: e.topicSlug,
            correct: correctAns,
          });
          console.log(user.Id);
          console.log(e.topicName);
          console.log(correctAns);
        }
      );

      //go to next page
      const nextQues = currentQuestion + 1;
      nextQues < display.length && setCurrentQuestion(nextQues);
    } else {
      alert("Please complete this question before proceeding!");
    }
  };

  //get mastery level to be display on next page load
  const displayMastery = () => {
    const fetchMastery = async (request: { id: string; skillSlug: string }) => {
      try {
        //update mastery of student
        const res = await axios.post(
          "http://localhost:3000/api/pybkt/get",
          request //assume correct
        ); //use data destructuring to get data from the promise object
        return res.data;
      } catch (error) {
        console.log(error);
      }
    };

    //should return list of skills + determine how to display each skill's matery if course contains more than 1 skill
    const progressData = topic.map(
      //change to topics of the course
      async (eachTopic: {
        topicSlug: string;
        topicName: string;
        topicLevel: string;
      }) => {
        await fetchMastery({ id: user.Id, skillSlug: eachTopic.topicName }); //CONFIGURE USER ID
      }
    );
  };

  //store submit data - can be ignored for now
  const handleSubmitButton = () => {
    let newScore = 0;
    for (let i = 0; i < display.length; i++) {
      display[i]?.answers.map(
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
        <ProgressBar progress={displayMastery} />
        {/* <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1A1A1A] px-5"></div> */}
        <div className="flex w-full flex-col items-start">
          <h4 className="mt-10 text-xl text-black">
            Question {currentQuestion + 1} of {display.length}
          </h4>
          <div className="mt-4 text-2xl text-black">
            {display[currentQuestion]?.questionContent}
          </div>
        </div>
        <div className="flex w-full flex-col">
          <Image
            src={
              display[currentQuestion]?.questionMedia[0]
                .questionMediaURL as string
            }
            alt={display[currentQuestion]?.questionContent as string}
            width="0"
            height="0"
            sizes="100vw"
            className="h-auto w-1/2 object-contain pt-6 pb-6"
          />
        </div>
        <div className="flex w-full flex-col">
          {display[currentQuestion]?.answers.map(
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
              currentQuestion + 1 === display.length
                ? handleSubmitButton
                : handleNext
            }
            className="w-[13%] rounded-lg bg-purple-500 py-3 hover:bg-purple-600"
          >
            {currentQuestion + 1 === display.length ? "Submit" : "Next"}
          </button>
        </div>
      </MainWrapper>
    </>
  );
}

// <fieldset>
//   <legend className="contents text-base font-medium text-gray-900">
//     Question 1
//   </legend>
//   {/* <select>{getQuestions(topicSelected)}</select> */}
//   <p className="text-sm text-gray-500">
//     To have content from planetscale
//   </p>
//   <Image
//     src="https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q01-1_bzugpn.png"
//     alt="Question 1"
//     width="0"
//     height="0"
//     sizes="100vw"
//     className="h-auto w-1/2 object-contain"
//   />
//   <div className="mt-4 space-y-4">
//     <div className="flex items-center">
//       <input
//         id="option-1"
//         name="option-1"
//         type="radio"
//         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//       />
//       <label
//         htmlFor="option-1"
//         className="ml-3 block text-sm font-medium text-gray-700"
//       >
//         0.2A
//       </label>
//     </div>
//     <div className="flex items-center">
//       <input
//         id="option-2"
//         name="option-2"
//         type="radio"
//         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//       />
//       <label
//         htmlFor="option-2"
//         className="ml-3 block text-sm font-medium text-gray-700"
//       >
//         1A
//       </label>
//     </div>
//     <div className="flex items-center">
//       <input
//         id="option-3"
//         name="option-3"
//         type="radio"
//         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//       />
//       <label
//         htmlFor="option-3"
//         className="ml-3 block text-sm font-medium text-gray-700"
//       >
//         0.6A
//       </label>
//     </div>
//     <div className="flex items-center">
//       <input
//         id="option-4"
//         name="option-4"
//         type="radio"
//         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//       />
//       <label
//         htmlFor="option-4"
//         className="ml-3 block text-sm font-medium text-gray-700"
//       >
//         0.8A
//       </label>
//     </div>
//   </div>
// </fieldset>
