import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const waitlist = await prisma.waitlist.findMany({
    select: {
      email: true,
    },
  });

  res.status(200).json(waitlist);
}
