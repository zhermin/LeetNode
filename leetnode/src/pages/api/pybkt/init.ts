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
  req.body.topics.map(
    async (topic: {
      topicSlug: string;
      topicName: string;
      topicLevel: QuestionDifficulty;
    }) => {
      console.log(topic.topicSlug);

      try {
        const { data } = await axios.post(
          `${process.env.RECOMMENDER_URL}/add-student/${session?.user?.id}/${topic.topicSlug}/`,
          {},
          {
            headers: {
              Accept: "application/json",
              access_token: process.env.RECOMMENDER_API_KEY,
            },
          }
        );
        console.log(data);

        if (data.Created) {
          try {
            const { data } = await axios.get(
              `${process.env.RECOMMENDER_URL}/get-mastery/${session?.user?.id}/${topic.topicSlug}/`,
              {
                headers: {
                  Accept: "application/json",
                  access_token: process.env.RECOMMENDER_API_KEY,
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
          // Check if mastery is in prisma table
          console.log(session?.user?.id);
          const masteryCheck: Mastery | null = await prisma.mastery.findUnique({
            where: {
              userId_topicSlug: {
                userId: session?.user?.id as string,
                topicSlug: topic.topicSlug as string,
              },
            },
          });
          // If initialised but not in prisma mastery table or masteryLevel === 0, add it in
          if (masteryCheck === null) {
            try {
              const { data } = await axios.get(
                `${process.env.RECOMMENDER_URL}/get-mastery/${session?.user?.id}/${topic.topicSlug}/`,

                {
                  headers: {
                    Accept: "application/json",
                    access_token: process.env.RECOMMENDER_API_KEY,
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
