import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.ACTION_KEY === req.headers.authorization?.split(" ")[1]) {
    // If authorised
    try {
      const getMastery = await prisma.mastery.findMany({
        select: {
          userId: true,
          topicSlug: true,
          masteryLevel: true,
          weeklyMasteryLevel: true,
        },
      });

      // Update weeklyMasteryLevel and fortnightlyMasteryLevel
      getMastery.map(async (row) => {
        await prisma.mastery.update({
          where: {
            userId_topicSlug: {
              userId: row.userId as string,
              topicSlug: row.topicSlug as string,
            },
          },
          data: {
            weeklyMasteryLevel: row.masteryLevel,
            fortnightlyMasteryLevel: row.weeklyMasteryLevel,
          },
        });
      });

      res.status(200).json({ updated: true });
    } catch (err) {
      res.status(400).json({ message: "Something went wrong" });
    }
  } else {
    res.status(401).json({ error: "Unauthorised" });
  }
}
