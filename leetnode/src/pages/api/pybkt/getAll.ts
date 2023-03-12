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
          // topicSlug: true,
          masteryLevel: req.body.period === "current" || true,
          weeklyMasteryLevel: req.body.period === "week",
          fortnightMasteryLevel: req.body.period === "fortnight",
          topic: {
            select: {
              topicName: true,
            }
          }
        },
      });
      const mastery =
        req.body.period === "current"
          ? "masteryLevel"
          : req.body.period === "week"
            ? "weeklyMasteryLevel"
            : "fortnightMasteryLevel";
      // Rename the key to masteryLevel for easier access
      const allMastery = getMastery.map((row) => {
        return {
          topicName: row.topic.topicName,
          masteryLevel: Math.round(row[`${mastery}`] * 10000) / 100, // Convert to % with 2dp
        };
      });
      res.status(200).json(allMastery);
    } catch (err) {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}
