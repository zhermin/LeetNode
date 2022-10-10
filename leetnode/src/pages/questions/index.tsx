import {
  Question,
  Topic,
  QuestionMedia,
  Attempt,
  Answer,
} from "@prisma/client";
import { prisma } from "@/server/db/client";

import { getSession } from "next-auth/react";
import Image from "next/future/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Latex from "react-latex-next";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";

interface quizProps {
  questions: (Question & {
    topic: Topic;
    questionMedia: QuestionMedia[];
    attempts: Attempt[];
    answers: Answer[];
  })[];
}

const questions = ({ questions }: quizProps) => {
  return (
    <>
      <Header />
      <Navbar />
      <MainWrapper>
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold leading-normal text-gray-700 md:text-[4rem]">
            All Questions
          </h1>
          <div className="mt-3 flex flex-col space-y-4 lg:w-3/4">
            {questions.map((question) => (
              <Link
                href={`/questions/${question.questionId}`}
                key={question.questionId}
              >
                <a className="overflow-hidden bg-white shadow-md duration-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 motion-safe:hover:shadow-2xl sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-xl font-medium leading-6 text-gray-900">
                      {question.topic.topicName}
                    </h2>
                    <h3 className="text-lg font-light leading-6 text-gray-900">
                      {question.topic.topicLevel} |{" "}
                      {question.questionDifficulty}
                    </h3>
                  </div>
                  {question.attempts.length > 0 ? (
                    <div className="border-y bg-gray-100 px-4 py-5 sm:px-6">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          Latest Attempt
                        </h3>
                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-col space-y-2">
                            <h3 className="text-lg font-light leading-6 text-gray-900">
                              Attempted At:{" "}
                              {question.attempts[0]?.submittedAt.toLocaleString()}
                            </h3>
                            <h3 className="text-lg font-light leading-6 text-gray-900">
                              Attempted Answer:{" "}
                              {question.attempts[0]?.attemptOption}
                            </h3>
                            <h3 className="text-lg font-light leading-6 text-gray-900">
                              Attempted Result:{" "}
                              {question.attempts[0]?.attemptOption ===
                              question.answers.find(
                                (answer) => answer.isCorrect
                              )?.optionNumber
                                ? "Correct"
                                : "Incorrect"}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-y bg-gray-100 px-4 py-5 sm:px-6">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          Not Attempted Yet
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <dd className="px-4 py-5 sm:px-6">
                        {question.questionMedia.map((media) =>
                          media.questionMediaURL ? (
                            <Image
                              key={media.questionId}
                              src={media.questionMediaURL}
                              alt={question.questionId}
                              width="0"
                              height="0"
                              sizes="100vw"
                              className="h-auto w-3/4"
                            />
                          ) : null
                        )}
                      </dd>
                      <dd className="px-4 py-5 text-sm text-gray-900 sm:px-6 md:text-base">
                        <h3 className="pb-1 font-mono">
                          #{question.questionId}
                        </h3>
                        <Latex>{question.questionContent}</Latex>
                      </dd>
                    </dl>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 sm:px-6">
                        {question.answers.map((answer) => (
                          <div
                            key={answer.optionNumber}
                            className="flex justify-between border-b py-4"
                          >
                            <dt className="text-xs font-medium text-gray-500 md:text-base">
                              Option {answer.optionNumber}
                            </dt>
                            <dd className="text-xs text-gray-900 md:text-base">
                              <Latex>{answer.answerContent}</Latex>
                            </dd>
                          </div>
                        ))}
                      </div>
                    </dl>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </main>
      </MainWrapper>
    </>
  );
};

export default questions;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { resolvedUrl, req } = context;
  const baseUrl = `${req.headers["x-forwarded-proto"] || "http"}://${
    req.headers["x-forwarded-host"] || req.headers.host
  }`;
  const currentUrl = `${baseUrl}${resolvedUrl}`;

  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${currentUrl}`,
        permanent: false,
      },
    };
  }

  const questions = await prisma.question.findMany({
    include: {
      questionMedia: true,
      topic: true,
      attempts: {
        where: {
          userId: session?.user?.id,
        },
        orderBy: {
          submittedAt: "desc",
        },
      },
      answers: true,
    },
  });

  return {
    props: {
      questions: JSON.parse(JSON.stringify(questions)),
    },
  };
};
