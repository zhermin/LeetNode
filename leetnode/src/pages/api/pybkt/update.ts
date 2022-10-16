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
    skillSlug: string;
    correct: string;
  }) => {
    try {
      //update mastery of student
      const res = await axios.post(
        `http://127.0.0.1:8000/update-state/${req.id}/${req.skillSlug}/${req.correct}`
      ); //use data destructuring to get data from the promise object
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  const display = await displayData(req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    //add updated mastery into Mastery table
    const mastery: Mastery = await prisma.mastery.create({
      data: {
        userId: req.body.id as string, //need pass id
        topicSlug: req.body.skillSlug as string,
        masteryLevel: Object.values(display)[0] as number, //access skill value
      },
    });
    console.log(mastery);
    console.log(req.body);
    res.status(200).json(req.body); // should be display
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
