import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const { id } = req.query;
  const question = await prisma.question.findFirst({
    where: {
      questionId: Number(id),
    },
    include: {
      topic: true,
      questionsWithAddedTime: {
        include: {
          attempts: {
            where: {
              userId: session?.user?.id,
            },
            orderBy: {
              submittedAt: "desc",
            },
          },
        },
      },
    },
  });

  res.status(200).json(question);
}
