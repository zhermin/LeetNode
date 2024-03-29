import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  } else {
    try {
      const currentDatetime = new Date();
      currentDatetime.setDate(1);
      const info = await prisma.user.findMany({
        where: {
          lastActive: {
            gt: new Date(currentDatetime.toISOString().substring(0, 10)), // Current month data
          },
        },
        orderBy: {
          points: "desc",
        },
        select: {
          id: true,
          username: true,
          image: true,
          points: true,
        },
      });
      res.status(200).json(info);
    } catch (error) {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}
