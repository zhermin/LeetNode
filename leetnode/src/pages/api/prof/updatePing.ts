import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //updates topicPing after each submission
  const updatePing = await prisma.mastery.update({
    where: {
      userId_topicSlug: {
        userId: req.body.userId,
        topicSlug: req.body.topicSlug,
      },
    },
    data: {
      topicPing: req.body.newPing,
    },
  });

  res.status(200).json(updatePing);
}
