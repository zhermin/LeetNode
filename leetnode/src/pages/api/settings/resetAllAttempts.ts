import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resetAllAttempts = await prisma.attempt.deleteMany({});

  res.status(200).json(resetAllAttempts);
}
