import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const posts = await prisma.course.findMany({
    select: {
      courseName: true,
    },
  });

  res.status(200).json(posts);
}
