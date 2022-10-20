import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import MainWrapper from "@/components/MainWrapper";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import axios from "axios";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export async function getStaticPaths() {
  const courses = await prisma.course.findMany();

  const paths = courses.map((c) => ({
    params: { resultsPage: c.courseSlug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(context: any) {
  const session = await getSession(context);
  const prisma = new PrismaClient();
  const test = await prisma.course.findMany();

  test.map((e) => console.log(e.courseSlug));

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
  console.log(questionDisplay);

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

export default function ShowResults({ questionDisplay, user, url }: any) {
  const router = useRouter();
  const { options } = router.query;

  const [results, setResults] = useState<
    { currentQuestion: number; isCorrect: string }[]
  >([]);

  useEffect(() => {
    if (!router.isReady) return;
    {
      if (!Array.isArray(results) || !results.length) {
        const optionString = options as string;
        console.log(JSON.parse(optionString));
        setResults(JSON.parse(optionString));
      }
    }
  }, [router.isReady, options, results]);

  return (
    <>
      <Header />
      <Navbar />
      <MainWrapper>
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

        <div>{results[0]?.isCorrect}</div>
      </MainWrapper>
    </>
  );
}
