import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const questions = await prisma.question.findMany({
    include: {
      topic: true,
      questionsWithAddedTime: {
        include: {
          attempts: true,
        },
      },
    },
  });

  res.status(200).json(questions);
}
