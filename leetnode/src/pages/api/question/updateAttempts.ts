import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //updates attempt after each submission
  const updateAttempt = await prisma.attempt.create({
    data: {
      userId: req.body.id,
      questionId: req.body.questionId,
      attemptOption: req.body.optionNumber,
      isCorrect: req.body.correct,
    },
  });
  console.log(updateAttempt.attemptId);

  res.status(200).json(updateAttempt);
}
