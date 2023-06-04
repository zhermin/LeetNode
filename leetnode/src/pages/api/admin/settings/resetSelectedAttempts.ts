import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  req.body.topics.map(async (topic: string) => {
    const resetSelectedAttempts = await prisma.attempt.deleteMany({
      where: {
        questionWithAddedTime: {
          question: {
            topic: {
              topicSlug: topic,
            },
          },
        },
      },
    });
    res.status(200).json(resetSelectedAttempts);
  });
}
