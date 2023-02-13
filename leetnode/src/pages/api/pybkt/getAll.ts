import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } else {
    try {
      const getMastery = await prisma.mastery.findMany({
        where: {
          userId: req.body.id,
        },
        select: {
          topicSlug: true,
          masteryLevel: true,
        },
      });
      res.status(200).json(getMastery);
    } catch (err) {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}
