import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  const questions = await prisma.question.findMany({
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

  res.status(200).json(questions);
}
