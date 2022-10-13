import { Key, useState } from "react";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import Image from "next/future/image";
import axios from "axios";
import Latex from "react-latex-next";

import { PrismaClient, Topic } from "@prisma/client";

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
  const topics: Topic[] = await prisma.topic.findMany();

  const paths = topics.map((t) => ({
    params: { topicName: t.topicName },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(context: any) {
  console.log(context.params);

  const displayData = async (request: { topicName: string }) => {
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
  // console.log(display);
  // console.log(display.length);
  return {
    props: {
      display,
    },
  };
}

export default function LoadTopic({ display }: any) {
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
    console.log(selectedOptions);
  };

  const handlePrevious = () => {
    const prevQues = currentQuestion - 1;
    prevQues >= 0 && setCurrentQuestion(prevQues);
  };

  const handleNext = () => {
    const nextQues = currentQuestion + 1;
    nextQues < display.length && setCurrentQuestion(nextQues);
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

  //temporary static json object - after successfully getting data from API endpoint, replace "question"
  const questions = [
    {
      topicName: "Thevenin Equivalent Circuit",
      topicLevel: "Foundational",
      questionContent:
        "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
      questionDifficulty: "Medium",
      questionMediaURL:
        "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q04_gxwt6z.png",
      answers: [
        {
          questionContent:
            "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
          optionNumber: 1,
          answerContent: "(4~Omega)",
          isCorrect: 1,
        },
        {
          questionContent:
            "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
          optionNumber: 2,
          answerContent: "(11~Omega)",
          isCorrect: 0,
        },
        {
          questionContent:
            "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
          optionNumber: 3,
          answerContent: "(10.2~Omega)",
          isCorrect: 0,
        },
        {
          questionContent:
            "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
          optionNumber: 4,
          answerContent: "(20.8~Omega)",
          isCorrect: 0,
        },
      ],
    },
    {
      topicName: "Thevenin Equivalent Circuit",
      topicLevel: "Foundational",
      questionContent:
        "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
      questionDifficulty: "Medium",
      questionMediaURL:
        "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q06-1_inu8j6.png",
      answers: [
        {
          questionContent:
            "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
          optionNumber: 1,
          answerContent: "(V_T = 7~V,~~~~~R_T = 1.2~Omega)",
          isCorrect: 1,
        },
        {
          questionContent:
            "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
          optionNumber: 2,
          answerContent: "(V_T = 7~V,~~~~~R_T = 1.33~Omega)",
          isCorrect: 0,
        },
        {
          questionContent:
            "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
          optionNumber: 3,
          answerContent: "(V_T = 7.4~V,~~~~~R_T = 1.2~Omega)",
          isCorrect: 0,
        },
        {
          questionContent:
            "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
          optionNumber: 4,
          answerContent: "(V_T = 7.4~V,~~~~~R_T = 1.33~Omega)",
          isCorrect: 0,
        },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <MainWrapper>
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
