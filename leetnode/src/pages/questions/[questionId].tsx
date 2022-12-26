import {
  Question,
  Topic,
  QuestionMedia,
  Attempt,
  Answer,
} from "@prisma/client";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import type { GetStaticPropsContext } from "next/types";

import Image from "next/image";
import Latex from "react-latex-next";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";

type question =
  | (Question & {
      topic: Topic;
      questionMedia: QuestionMedia[];
      answers: Answer[];
      attempts: Attempt[];
    })
  | null;

const fetchQuestion = async (questionId: string) =>
  await axios
    .get(`/api/question/${questionId}`)
    .then((res) => res.data)
    .catch((err: AxiosError) => {
      if (err.response?.status === 401) {
        signIn();
      }
    });

const Question = () => {
  const router = useRouter();
  const { questionId } = router.query;
  const {
    data: question,
    isLoading,
    isError,
    error,
  } = useQuery<question, AxiosError>(["user-question-by-id"], () =>
    fetchQuestion(questionId as string)
  );

  if (isLoading || !question) return <div>Loading...</div>;
  if (isError) return <div>{error.message}</div>;

  return (
    <>
      <Header />
      <Navbar />
      <MainWrapper>
        <div key={question.questionId} className="my-6">
          <a className="overflow-hidden bg-white shadow-md duration-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 motion-safe:hover:shadow-2xl sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-medium leading-6 text-gray-900">
                {question.topic.topicName}
              </h2>
              <h3 className="text-lg font-light leading-6 text-gray-900">
                {question.topic.topicLevel} | {question.questionDifficulty}
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
                        Attempted Answer: {question.attempts[0]?.attemptOption}
                      </h3>
                      <h3 className="text-lg font-light leading-6 text-gray-900">
                        Attempted Result:{" "}
                        {question.attempts[0]?.attemptOption ===
                        question.answers.find((answer) => answer.isCorrect)
                          ?.optionNumber
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
                        alt={`Question ${question.questionId}`}
                        width="0"
                        height="0"
                        sizes="100vw"
                        className="h-auto w-3/4"
                      />
                    ) : null
                  )}
                </dd>
                <dd className="px-4 py-5 text-sm text-gray-900 sm:px-6 md:text-base">
                  <span className="pr-3 font-mono">#{question.questionId}</span>
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
        </div>
      </MainWrapper>
    </>
  );
};

export default Question;

export async function getStaticProps(context: GetStaticPropsContext) {
  const questionId = context.params?.questionId as string;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["user-question-by-id"], () =>
    fetchQuestion(questionId)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
