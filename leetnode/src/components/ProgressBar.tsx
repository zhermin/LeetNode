import { Center, Loader } from "@mantine/core";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const ProgressBar = ({
  topicSlug,
  topicName,
}: {
  topicSlug: string;
  topicName: string;
}) => {
  //get mastery level to be display on page

  //this method displays mastery based on prisma database
  // const masteryDisplay = [];
  // for (let i = 0; i < masteryLevel.length; i++) {
  //   if (masteryLevel[i]?.topicSlug == topicSlug) {
  //     masteryDisplay.push(masteryLevel[i]);
  //   }
  // }
  // console.log(masteryDisplay); //should return [{userId: ,topicSlug: , masteryLevel: ,}]

  const session = useSession();

  //this  method displays mastery based on api calls
  const [details, setDetails] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .post("http://localhost:3000/api/pybkt/get", {
        id: session?.data?.user?.id,
        topicSlug: topicSlug,
        //change contents of topicSlug to topicSlug
      })
      .then((response) => {
        setLoading(false);
        setDetails(response.data);
      });
  }, [topicSlug, session?.data?.user?.id]);

  const results = details;
  // const results = masteryDisplay[0]?.masteryLevel;
  const roundedResults = Math.round((results as number) * 10000) / 100;
  console.log(roundedResults);

  return (
    <>
      {loading === true ? (
        <Center style={{ height: 500 }}>
          <Loader />
        </Center>
      ) : (
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
      )}
    </>
  );
};

export default ProgressBar;
