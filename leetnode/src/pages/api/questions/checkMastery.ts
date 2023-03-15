import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //check attempt after each submission
  const checkMastery = await prisma.mastery.findUnique({
    where: {
      userId_topicSlug: {
        userId: req.body.id,
        topicSlug: req.body.topicSlug,
      },
    },
  });

  res.status(200).json(checkMastery);
}
