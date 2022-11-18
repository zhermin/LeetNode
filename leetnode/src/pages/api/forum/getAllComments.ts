import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

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
