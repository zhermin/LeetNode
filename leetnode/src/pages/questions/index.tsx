import {
  Question,
  Topic,
  QuestionMedia,
  Attempt,
  Answer,
} from "@prisma/client";
import axios, { AxiosError } from "axios";
import { getSession, GetSessionParams, signIn } from "next-auth/react";
import {
  dehydrate,
  QueryCache,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";

import Image from "next/image";
import Link from "next/link";
import Latex from "react-latex-next";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Center, Loader } from "@mantine/core";
import toast from "react-hot-toast";

type questionType = (Question & {
  topic: Topic;
  questionMedia: QuestionMedia[];
  attempts: Attempt[];
  answers: Answer[];
})[];

const fetchUserQuestions = async () => {
  try {
    const { data } = await axios.get("/api/question/getAllQuestions");
    return data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      signIn("google");
    }
    console.log(error);
    throw error;
  }
};

const AllQuestionsPage = () => {
  const {
    data: questions,
    isLoading,
    isFetching,
    isError,
  } = useQuery<questionType>(["all-user-questions"], fetchUserQuestions);

  if (isLoading || isFetching || !questions)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isError) return <div>Something went wrong!</div>;

  return (
    <>
      <Header />
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-bold leading-normal text-gray-700 md:text-6xl">
          All Questions
        </h1>
        <div className="mt-3 flex flex-col space-y-4 lg:w-3/4">
          {questions.map((question) => (
            <Link
              href={`/questions/${question.questionId}`}
              key={question.questionId}
              className="overflow-hidden bg-white shadow-md duration-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 motion-safe:hover:shadow-2xl sm:rounded-lg"
            >
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
                          Attempted Answer:{" "}
                          {question.attempts[0]?.attemptOption}
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
                    <span className="pr-3 font-mono">
                      #{question.questionId}
                    </span>
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
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AllQuestionsPage;

export async function getStaticProps(context: GetSessionParams) {
  const session = await getSession(context);
  if (!session) signIn("google");

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Something went wrong: ${error.message}`);
        }
      },
    }),
  });
  await queryClient.prefetchQuery<questionType>(
    ["all-user-questions"],
    fetchUserQuestions
  );

  console.log(
    "[PREFETCHED USER QUESTIONS]",
    queryClient.getQueryData(["all-user-questions"])
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
