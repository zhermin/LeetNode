import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allUsersMasteriesAndAttempts = await prisma.user.findMany({
    include: {
      masteries: true,
      attempts: true,
    },
  });

  res.status(200).json(allUsersMasteriesAndAttempts);
}
