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
        <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
            Leet<span className="text-purple-300">Node</span>
          </h1>
          <Link href="/welcome">
            <a className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 mt-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-500 hover:bg-purple-600">
              Start Your Journey
            </a>
          </Link>
        </main>
      </MainWrapper>
    </>
  );
};

export default Home;
