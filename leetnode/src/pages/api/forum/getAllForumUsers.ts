import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const forumUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      image: true,
    },
  });

  res.status(200).json(forumUsers);
}
