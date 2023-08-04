import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Updates lastActive after each submission
  const updateActive = await prisma.user.update({
    where: {
      id: req.body.id,
    },
    data: {
      lastActive: new Date(),
    },
  });

  res.status(200).json(updateActive);
}
