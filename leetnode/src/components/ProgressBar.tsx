import axios from "axios";
import { useState, useEffect } from "react";

const ProgressBar = ({
  topicSlug,
  userId,
  topicName,
  masteryLevel,
}: {
  topicSlug: string;
  userId: string;
  topicName: string;
  masteryLevel: { userId: string; topicSlug: string; masteryLevel: number }[];
}) => {
  //get mastery level to be display on page

  //this method displays mastery based on prisma database
  const masteryDisplay = [];
  for (let i = 0; i < masteryLevel.length; i++) {
    if (masteryLevel[i]?.topicSlug == topicSlug) {
      masteryDisplay.push(masteryLevel[i]);
    }
  }
  console.log(masteryDisplay); //should return [{userId: ,topicSlug: , masteryLevel: ,}]

  //this  method displays mastery based on api calls
  // const [details, setDetails] = useState<{ Mastery: number }>();

  // useEffect(() => {
  //   axios
  //     .post("http://localhost:3000/api/pybkt/get", {
  //       id: userId,
  //       topicSlug: topicSlug,
  //       //change contents of topicSlug to topicSlug
  //     })
  //     .then((response) => {
  //       setDetails(response.data);
  //     });
  // }, [topicSlug, userId]);

  // const results = details?.Mastery;
  const results = masteryDisplay[0]?.masteryLevel;
  const roundedResults = Math.round((results as number) * 10000) / 100;
  console.log(roundedResults);

  return (
    <div className="relative pt-10">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-s inline-block rounded-full bg-cyan-200 py-1 px-2 font-semibold uppercase text-cyan-600">
            {topicName}
          </span>
        </div>
        <div className="text-right">
          <span className="text-s inline-block font-semibold text-cyan-600">
            {roundedResults}
          </span>
        </div>
      </div>
      <div className="mb-4 flex h-2.5 overflow-hidden rounded bg-cyan-200">
        <div
          // if want percentage for css, do in **.** format
          style={{ width: `${roundedResults}%` }}
          className="flex flex-col justify-center whitespace-nowrap bg-cyan-500 text-center text-white shadow-none"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
