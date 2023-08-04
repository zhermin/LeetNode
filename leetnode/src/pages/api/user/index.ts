import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } else {
    try {
      const userInfo = await prisma.user.findFirst({
        where: {
          id: req.body.id,
        },
        select: {
          nusnetId: true,
          username: true,
          image: true,
          lastActive: true,
          loginStreak: true,
          points: true,
        },
      });

      const startDateTime = new Date();
      startDateTime.setDate(
        startDateTime.getDate() - (userInfo?.loginStreak ?? 1) + 1
      );
      startDateTime.setHours(0, 0, 0, 0);
      const attempts = await prisma.attempt.findMany({
        where: {
          userId: req.body.id,
          submittedAt: {
            // Get all attempts done since beginning of streak
            gte: startDateTime,
          },
        },
      });

      const attemptsPerDay: { [timestamp: string]: number } = {}; // { timestamp: count }

      attempts.map((attempt) => {
        const submittedAt = new Date(attempt.submittedAt);
        if (submittedAt.toDateString() in attemptsPerDay) {
          attemptsPerDay[submittedAt.toDateString()] += 1;
        } else {
          attemptsPerDay[submittedAt.toDateString()] = 1;
        }
      });

      res.status(200).json({ ...userInfo, attempts: attemptsPerDay });
    } catch (error) {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}
