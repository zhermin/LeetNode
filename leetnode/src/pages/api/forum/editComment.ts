import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await prisma.comment.update({
    where: {
      commentId: req.body.commentId,
    },
    data: {
      message: req.body.message,
    },
  });

  res.status(200).json({ message: "Comment edited successfully!" });
}
