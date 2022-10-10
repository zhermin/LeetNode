import type { NextPage } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";

const Home: NextPage = () => {
  return (
    <>
      <Header />
      <Navbar />

      <MainWrapper>
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
            Leet<span className="text-cyan-400">Node</span>
          </h1>
          <Link href="/welcome">
            <a className="mt-3 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-cyan-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-600">
              Start Your Journey
            </a>
          </Link>
        </main>
      </MainWrapper>
    </>
  );
};

export default Home;
