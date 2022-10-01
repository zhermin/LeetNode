import MainWrapper from "@/components/MainWrapper";
import Navbar from "@/components/Navbar";

const welcome = () => {
  return (
    <>
      <Navbar />

      <MainWrapper>
        <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-5xl md:text-[4rem] leading-normal font-bold text-gray-700">
            Choose Your Battle
          </h1>
          <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-3 lg:w-2/3">
            <TechnologyCard
              name="Foundational"
              description="TODO: Foundational topics data from our database"
              documentation="https://nextjs.org/"
            />
            <TechnologyCard
              name="Intermediate"
              description="TODO: Intermediate topics data from our database"
              documentation="https://www.typescriptlang.org/"
            />
            <TechnologyCard
              name="Advanced"
              description="TODO: Advanced topics data from our database"
              documentation="https://tailwindcss.com/"
            />
          </div>
        </main>
      </MainWrapper>
    </>
  );
};

export default welcome;

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const TechnologyCard = ({
  name,
  description,
  documentation,
}: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-between p-4 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700 font-bold pb-2 border-b-2 border-b-slate-500">
        {name}
      </h2>
      <p className="text-sm text-gray-600 py-3">{description}</p>
      <a
        className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
        href={documentation}
        target="_blank"
        rel="noreferrer"
      >
        Start Quiz
      </a>
    </section>
  );
};
