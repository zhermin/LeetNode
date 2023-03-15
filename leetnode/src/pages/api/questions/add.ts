import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

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

  res.status(201).json({
    message: `Question created successfully`,
    data: question,
  });
}
