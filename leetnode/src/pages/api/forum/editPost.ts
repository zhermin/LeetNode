import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const postchange = await prisma.post.update({
    where: {
      postId: req.body.postId,
    },
    data: {
      message: req.body.message,
    },
  });

  res.status(200).json(postchange);
}
