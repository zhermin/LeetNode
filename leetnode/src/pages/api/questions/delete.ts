import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query;
  const question = await prisma.question.delete({
    where: {
      questionId: Number(id),
    }
  });

  res.status(200).json({
    message: `Question deleted successfully`,
    data: question,
  });
}
