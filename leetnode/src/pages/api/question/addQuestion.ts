import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const question = await prisma.question.create({
    data: {
      variationId: req.body.variationId,
      topicSlug: req.body.topicSlug,
      questionTitle: req.body.questionTitle,
      questionDifficulty: req.body.questionDifficulty,
      questionContent: req.body.questionContent,
      questionData: req.body.questionData,
    },
  });

  res.status(200).json(question);
}
