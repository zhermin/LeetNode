import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const deletedQuestion = await prisma.question.delete({
    where: {
      questionId_variationId: {
        questionId: Number(req.query.questionId as string),
        variationId: Number(req.query.variationId as string),
      },
    },
  });

  res.status(200).json({
    message: `Question deleted successfully`,
    data: deletedQuestion,
  });
}
