import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  // if (!session) {
  //   res.status(401).json({ message: "Unauthorized" });
  //   return;
  // }

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
