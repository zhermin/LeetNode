import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { prisma } from "@/server/db/client";
import { Mastery } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const displayData = async (req: {
    id: string;
    topicSlug: string;
    correct: number;
  }) => {
    try {
      //update mastery of student
      //prettier-ignore
      const res = await axios.patch(
        `https://api-deployment.onrender.com/update-state/${req.id}/${req.topicSlug}/${String(req.correct)}`,
        req
      ); //use data destructuring to get data from the promise object
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  const display = await displayData(req.body);
  console.log(display);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // update instead of create (in Mastery table) if exist
    const mastery: Mastery = await prisma.mastery.upsert({
      where: {
        userId_topicSlug: {
          userId: req.body.id as string,
          topicSlug: req.body.topicSlug as string,
        },
      },
      update: {
        masteryLevel: Object.values(display)[0] as number,
      },
      create: {
        userId: req.body.id as string,
        topicSlug: req.body.topicSlug as string,
        masteryLevel: Object.values(display)[0] as number,
      },
    });
    console.log(mastery);
    console.log(req.body);
    res.status(200).json(req.body); // should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
