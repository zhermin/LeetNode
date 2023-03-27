import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";

import { prisma } from "@/server/db/client";
import { Mastery, QuestionDifficulty } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  // const initUser = async (input: {
  //   id: string;
  // topics: {
  //   topicSlug: string;
  //   topicName: string;
  //   topicLevel: QuestionDifficulty;
  // }[];
  // }) => {
  req.body.topics.map(
    async (topic: {
      topicSlug: string;
      topicName: string;
      topicLevel: QuestionDifficulty;
    }) => {
      console.log(topic.topicSlug);
      try {
        const { data } = await axios.post(
          `https://pybkt-api-deployment.herokuapp.com/add-student/${session?.user?.id}/${topic.topicSlug}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${process.env.HEROKU_API_KEY as string}`,
            },
          }
        );
        console.log(data);
        if (data.Created) {
          try {
            const { data } = await axios.get(
              `https://pybkt-api-deployment.herokuapp.com/get-mastery/${session?.user?.id}/${topic.topicSlug}/`,

              {
                headers: {
                  Authorization: `Bearer ${
                    process.env.HEROKU_API_KEY as string
                  }`,
                },
              }
            );
            console.log(data);
            const mastery: Mastery = await prisma.mastery.create({
              data: {
                userId: session?.user?.id as string,
                topicSlug: topic.topicSlug as string,
                masteryLevel: data.Mastery as number,
              },
            });
            console.log(mastery);
            return data;
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ detail: string }>;
        if (axiosError.response?.data?.detail === "Data already exists") {
          console.log("Already initialised");
          // check if mastery is in prisma table
          console.log(session?.user?.id);
          const masteryCheck: Mastery | null = await prisma.mastery.findUnique({
            where: {
              userId_topicSlug: {
                userId: session?.user?.id as string,
                topicSlug: topic.topicSlug as string,
              },
            },
          });
          //if initialised but not in prisma mastery table or masteryLevel === 0, add it in
          if (masteryCheck === null) {
            try {
              const { data } = await axios.get(
                `https://pybkt-api-deployment.herokuapp.com/get-mastery/${session?.user?.id}/${topic.topicSlug}/`,

                {
                  headers: {
                    Authorization: `Bearer ${
                      process.env.HEROKU_API_KEY as string
                    }`,
                  },
                }
              );
              const masteryAdd = await prisma.mastery.create({
                data: {
                  userId: session?.user?.id as string,
                  topicSlug: topic.topicSlug as string,
                  masteryLevel: data.Mastery as number,
                },
              });
              console.log(masteryAdd);
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          console.log(axiosError);
          throw new Error("Failed to initialise");
        }
      }
    }
  );
  try {
    res.status(200).json("Success");
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}

// console.log(req.body);
// const display = initUser(req.body);

// });
