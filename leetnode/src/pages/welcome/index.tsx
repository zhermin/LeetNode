import { Topic, TopicLevel } from "@prisma/client";
import { prisma } from "@/server/db/client";

import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import WelcomeCard from "@/components/welcome/WelcomeCard";

interface welcomeProps {
  topics: Topic[];
}

const welcome = ({ topics }: welcomeProps) => {
  return (
    <>
      <Navbar />

      <MainWrapper>
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold leading-normal text-gray-700 md:text-[4rem]">
            Choose Your Battle
          </h1>
          <div className="mt-3 grid gap-5 pt-3 md:grid-cols-3 lg:w-3/4">
            <WelcomeCard
              name="Foundational"
              description="Foundational topics are the building blocks of electrical and computer engineering. These topics are the bedrock of your electrical and computer engineering knowledge and are the most important to master."
              topics={topics.filter(
                (topic) => topic.topicLevel === TopicLevel.Foundational
              )}
              link="https://nextjs.org/"
              color="bg-emerald-500"
            />
            <WelcomeCard
              name="Intermediate"
              description="Intermediate topics are the next level of electrical and computer engineering. These topics build upon the foundational topics and are the next step in your journey."
              topics={topics.filter(
                (topic) => topic.topicLevel === TopicLevel.Intermediate
              )}
              link="https://www.typescriptlang.org/"
              color="bg-amber-400"
            />
            <WelcomeCard
              name="Advanced"
              description="Advanced topics are the most advanced topics in electrical and computer engineering. These topics require a deep understanding of the foundational and intermediate topics and will challenge you to the fullest extent."
              topics={topics.filter(
                (topic) => topic.topicLevel === TopicLevel.Advanced
              )}
              link="https://tailwindcss.com/"
              color="bg-red-500"
            />
          </div>
        </main>
      </MainWrapper>
    </>
  );
};

export default welcome;

export async function getStaticProps() {
  const topics: Topic[] = await prisma.topic.findMany();

  return {
    props: {
      topics: topics,
    },
  };
}
