import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>LeetNode - Personalized Path Mastery</title>
        <meta
          name="description"
          content="Achieve mastery in concepts by doing questions tailored to your skill level. Receive feedback on your progression and challenge yourself as you advance through progressively more advanced questions for each individual topic."
        />
      </Head>

      <Navbar />

      <MainWrapper>
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
            Leet<span className="text-purple-300">Node</span>
          </h1>
          <Link href="/welcome">
            <a className="mt-3 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-purple-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-purple-600">
              Start Your Journey
            </a>
          </Link>
        </main>
      </MainWrapper>
    </>
  );
};

export default Home;
