import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const getMastery = await prisma.mastery.findUnique({
    where: {
      userId_topicSlug: {
        userId: req.body.id,
        topicSlug: req.body.topicSlug,
      },
    },
  });
  console.log(getMastery?.masteryLevel);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json(getMastery?.masteryLevel);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
