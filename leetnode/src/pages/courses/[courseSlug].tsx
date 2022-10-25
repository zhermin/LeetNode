import {
  Course,
  Answer,
  Attempt,
  Question,
  QuestionMedia,
  QuestionWithAddedTime,
  Topic,
  UserCourseQuestion,
  User,
} from "@prisma/client";
import { prisma } from "@/server/db/client";

import axios from "axios";
import { useState } from "react";
import { getSession, GetSessionParams } from "next-auth/react";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import PracticeQuestion from "@/components/PracticeQuestion";
import ResultsPage from "@/components/ResultsPage";

type allQuestionsType = (UserCourseQuestion & {
  questionsWithAddedTime: (QuestionWithAddedTime & {
    question: Question & {
      attempts: Attempt[];
      topic: Topic;
      questionMedia: QuestionMedia[];
      answers: Answer[];
    };
  })[];
})[];

export default function CourseMainPage({
  questionDisplay,
  user,
  url,
  courseName,
}: {
  questionDisplay: allQuestionsType;
  user: User[];
  url: string;
  courseName?: string;
}) {
  const [openTab, setOpenTab] = useState(1);
  const [quizTab, setQuizTab] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    { currentQuestion: number; answerByUser: string }[]
  >([]);
  const [attempt, setAttempt] = useState<
    { currentQuestion: number; isCorrect: number }[]
  >([]);
  const [questionHistory, setQuestionHistory] = useState<
    {
      questionId: number;
      topicName: string;
      questionDifficulty: string;
      isCorrect: number;
    }[]
  >([]);
  console.log(url);

  return (
    <>
      <Header />
      <Navbar />
      <div className="flex h-screen flex-row rounded border border-b border-gray-200 dark:border-gray-700">
        <div className="flex basis-1/4 flex-col">
          <div>
            <div className="-mb-px flex flex-wrap  border-gray-300 bg-gray-50 text-center font-medium text-gray-500 dark:text-gray-400">
              {/* <div
                className={
                  "flex-auto text-sm" + (openTab === 1 ? "" : " bg-gray-200")
                }
              > */}
              <div
                className={
                  " flex-auto border-b-2 p-4 text-center text-sm active:border-b-2 active:border-blue-400 active:text-blue-400" +
                  (openTab === 1
                    ? " border-blue-500 text-blue-500"
                    : " bg-gray-200")
                }
                aria-current="page"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(1);
                }}
                role="tablist"
              >
                Learn
              </div>
              <div
                className={
                  "flex-auto border-b-2 p-4 text-center text-sm active:border-b-2 active:border-blue-400 active:text-blue-400" +
                  (openTab === 2
                    ? " border-blue-500 text-blue-500"
                    : " bg-gray-200")
                }
                aria-current="page"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(2);
                }}
                role="tablist"
              >
                Practice
              </div>
            </div>
            {/* content for Learn tab */}
            <div className={openTab === 1 ? "block" : "hidden"} id="link1">
              <div className="overflow-y-auto rounded bg-gray-50 py-4 px-3 dark:bg-gray-800">
                <div className="mt-4 space-y-2 text-center text-xl font-bold">
                  {courseName}
                </div>
                <ul className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <li>
                    <a
                      href="#"
                      className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                      </svg>
                      <span className="ml-3">Overview</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="group flex items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                      </svg>
                      <span className="ml-3">Lecture Slides</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="group flex items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18.175,4.142H1.951C1.703,4.142,1.5,4.344,1.5,4.592v10.816c0,0.247,0.203,0.45,0.451,0.45h16.224c0.247,0,0.45-0.203,0.45-0.45V4.592C18.625,4.344,18.422,4.142,18.175,4.142 M4.655,14.957H2.401v-1.803h2.253V14.957zM4.655,12.254H2.401v-1.803h2.253V12.254z M4.655,9.549H2.401V7.747h2.253V9.549z M4.655,6.846H2.401V5.043h2.253V6.846zM14.569,14.957H5.556V5.043h9.013V14.957z M17.724,14.957h-2.253v-1.803h2.253V14.957z M17.724,12.254h-2.253v-1.803h2.253V12.254zM17.724,9.549h-2.253V7.747h2.253V9.549z M17.724,6.846h-2.253V5.043h2.253V6.846z"></path>
                      </svg>
                      <span className="ml-3">Lecture Videos</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="group flex items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                        <path
                          fill-rule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <span className="ml-3">Additional Resources</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="group flex items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <span className="ml-3">Course Discussion</span>
                    </a>
                  </li>
                </ul>
                <ul className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <li>
                    <a
                      href="#"
                      className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.388,10.049l4.76-4.873c0.303-0.31,0.297-0.804-0.012-1.105c-0.309-0.304-0.803-0.293-1.105,0.012L6.726,9.516c-0.303,0.31-0.296,0.805,0.012,1.105l5.433,5.307c0.152,0.148,0.35,0.223,0.547,0.223c0.203,0,0.406-0.08,0.559-0.236c0.303-0.309,0.295-0.803-0.012-1.104L8.388,10.049z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <span className="ml-3 flex-1 whitespace-nowrap">
                        Back To Courses
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            {/* content for Practic -> Question */}
            <div className={openTab === 2 ? "block" : "hidden"} id="link1">
              {questionHistory.map((questionDone) => (
                <div key={questionDone?.questionId}>
                  <h5>ID: {questionDone?.questionId}</h5>
                  <h5>Topic Name: {questionDone?.topicName}</h5>
                  <h5>Difficulty: {questionDone?.questionDifficulty}</h5>
                  <h5>Result: {questionDone?.isCorrect}</h5>
                </div>
              ))}
            </div>

            {/* <div className="flex px-4 py-5 text-center">
              <div className={openTab === 1 ? "block" : "hidden"} id="link1">
                <h5>{courseName}</h5>
                <p></p>
              </div>
              <div className={openTab === 2 ? "block" : "hidden"} id="link2">
                <h5>{courseName}</h5>
                <p></p>
              </div>
            </div> */}
          </div>
        </div>
        {openTab === 2 ? (
          <div className="flex basis-3/4 flex-col">
            <div>
              <div className="-mb-px flex flex-wrap border-gray-300 bg-white text-center font-medium text-gray-500 dark:text-gray-400">
                <div
                  className={
                    "flex-auto text-sm" + (quizTab === 1 ? "" : " bg-gray-200")
                  }
                >
                  <a
                    className={
                      "inline-flex border-b-2 p-4 active:border-b-2 active:border-blue-400 active:text-blue-400" +
                      (quizTab === 1 ? " border-blue-500 text-blue-500" : "")
                    }
                    aria-current="page"
                    href="#question"
                    onClick={(e) => {
                      e.preventDefault();
                      setQuizTab(1);
                    }}
                    role="tablist"
                  >
                    Question
                  </a>
                </div>
                <div
                  className={
                    "flex-auto text-sm" + (quizTab === 2 ? "" : " bg-gray-200")
                  }
                >
                  <a
                    className={
                      "inline-flex border-b-2 p-4 active:border-b-2 active:border-blue-400 active:text-blue-400" +
                      (quizTab === 2 ? " border-blue-500 text-blue-500" : "")
                    }
                    aria-current="page"
                    href="#attempt"
                    onClick={(e) => {
                      e.preventDefault();
                      setQuizTab(2);
                    }}
                    role="tablist"
                  >
                    Attempt
                  </a>
                </div>
                <div
                  className={
                    "flex-auto text-sm" + (quizTab === 3 ? "" : " bg-gray-200")
                  }
                >
                  <a
                    className={
                      "inline-flex border-b-2 p-4 active:border-b-2 active:border-blue-400 active:text-blue-400" +
                      (quizTab === 3 ? " border-blue-500 text-blue-500" : "")
                    }
                    aria-current="page"
                    href="#discussion"
                    onClick={(e) => {
                      e.preventDefault();
                      setQuizTab(3);
                    }}
                    role="tablist"
                  >
                    Discussion
                  </a>
                </div>
              </div>
            </div>
            {openTab === 2 && quizTab === 1 ? (
              <div className="px-2 py-2">
                <PracticeQuestion
                  questionDisplay={questionDisplay}
                  user={user}
                  selectedOptions={selectedOptions}
                  setSelectedOptions={setSelectedOptions}
                  attempt={attempt}
                  setAttempt={setAttempt}
                  currentQuestion={currentQuestion}
                  setCurrentQuestion={setCurrentQuestion}
                  setQuestionHistory={setQuestionHistory}
                />
              </div>
            ) : openTab === 2 && quizTab === 2 ? (
              <div className="px-2 py-2">
                <ResultsPage
                  questionDisplay={questionDisplay}
                  attempt={attempt}
                  user={user}
                />
              </div>
            ) : (
              <div className="px-2 py-2">Forum Page</div>
            )}
          </div>
        ) : (
          <div>test</div>
        )}
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const courses: Course[] = await prisma.course.findMany();

  const paths = courses.map((c) => ({
    params: { courseSlug: c.courseSlug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(
  context: GetSessionParams & { params: { courseSlug: string } }
) {
  const session = await getSession(context);

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

  const questionDisplay = display.questionsWithAddedTime;
  console.log(questionDisplay);
  const course = await prisma.course.findUnique({
    where: {
      courseSlug: context.params.courseSlug,
    },
    select: {
      courseName: true,
    },
  });
  console.log(course);

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
      courseName: course?.courseName,
      questionDisplay,
      user: users,
      url: context.params,
    },
  };
}
