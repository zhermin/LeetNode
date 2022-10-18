import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { PrismaClient, Mastery } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const displayData = async (req: {
    id: string;
    topicSlug: string;
    correct: string;
  }) => {
    try {
      //update mastery of student
      const res = await axios.post(
        `http://127.0.0.1:8000/update-state/${req.id}/${req.topicSlug}/${req.correct}`
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
    //add updated mastery into Mastery table
    // update instead of create if exist
    const mastery: Mastery = await prisma.mastery.create({
      data: {
        userId: req.body.id as string,
        topicSlug: req.body.topicSlug as string,
        masteryLevel: Object.values(display)[0] as number, //access skill value
      },
    });
    console.log(mastery);
    console.log(req.body);
    res.status(200).json(req.body); // should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
