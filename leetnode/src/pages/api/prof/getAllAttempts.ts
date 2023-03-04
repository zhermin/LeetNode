import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const getAllAttempts = await prisma.attempt.findMany({
    include: {
      user: true,
      question: true,
      answer: true,
    },
  });

  res.status(200).json(getAllAttempts);
}
