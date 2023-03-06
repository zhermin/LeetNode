import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query;
  const question = await prisma.question.update({
    where: {
      questionId: Number(id),
    },
    data: {
      variationId: req.body.variationId,
      topicSlug: req.body.topicSlug,
      questionTitle: req.body.questionTitle,
      questionDifficulty: req.body.questionDifficulty,
      questionContent: req.body.questionContent,
      questionData: req.body.questionData,
    },
  });

  res.status(200).json({
    message: `Question updated successfully`,
    data: question,
  });
}
