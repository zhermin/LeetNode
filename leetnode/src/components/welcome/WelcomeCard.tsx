import { Topic } from "@prisma/client";
import Link from "next/link";

interface WelcomeCardProps {
  name: string;
  description: string;
  topics: Topic[];
  link: string;
  color: string;
}

const WelcomeCard = ({
  name,
  description,
  topics,
  link,
  color,
}: WelcomeCardProps) => {
  return (
    <Link href={link}>
      <a className="rounded-xl border bg-zinc-50 shadow-md duration-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 motion-safe:hover:scale-105">
        <h2
          className={`${color} mb-4 rounded-t-xl border-b-2 p-4 text-center text-xl font-medium text-white`}
        >
          {name}
        </h2>
        <div className="mx-4 flex items-baseline border-b-2 pb-4 text-slate-900">
          <span className="text-md mb-2 text-justify font-normal text-slate-500">
            {description}
          </span>
        </div>
        <ul role="list" className="my-7 space-y-5 px-4">
          {topics.map((topic) => (
            <li key={topic.topicSlug} className="flex space-x-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-slate-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M16 12l-6 6V6z" />
              </svg>
              <span className="text-left text-base font-normal leading-tight text-slate-500">
                {topic.topicName}
              </span>
            </li>
          ))}
        </ul>
      </a>
    </Link>
  );
};

export default WelcomeCard;
