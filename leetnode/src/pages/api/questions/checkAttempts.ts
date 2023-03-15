import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //check attempt after each submission
  const checkAttempts = await prisma.attempt.findMany({
    where: {
      userId: req.body.id,
      question: {
        topicSlug: req.body.topicSlug,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  res.status(200).json(checkAttempts);
}
