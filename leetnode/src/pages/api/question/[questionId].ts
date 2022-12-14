import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const questionId = Number(req.query.questionId);

  const question = await prisma.question.findFirst({
    where: {
      questionId: questionId,
    },
    include: {
      questionMedia: true,
      topic: true,
      attempts: {
        where: {
          userId: session?.user?.id,
        },
        orderBy: {
          submittedAt: "desc",
        },
      },
      answers: true,
    },
  });

  res.status(200).json(question);
}
