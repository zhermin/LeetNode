import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const comments = await prisma.comment.findMany({
    include: {
      commentMedia: true,
    },
    where: {
      postId: req.body.postId,
    },
  });

  res.status(200).json(comments);
}
