import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //check mastery average
  const getAllQuestions = await prisma.question.findMany({
    include: {
      attempts: true,
      questionMedia: true,
      answers: true,
      questionsWithAddedTime: true,
    },
  });

  res.status(200).json(getAllQuestions);
}
