import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const emailFreq = await prisma.user.update({
    where: {
      id: req.body.id,
    },
    data: {
      emailFrequency: req.body.emailFreq,
    },
  });

  res.status(200).json(emailFreq);
}
