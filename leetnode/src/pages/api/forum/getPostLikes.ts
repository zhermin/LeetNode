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

  const postLikes = await prisma.postLikes.upsert({
    where: {
      postId_userId: {
        postId: req.body.postId,
        userId: req.body.userId,
      },
    },
    update: {},
    create: {
      postId: req.body.postId,
      userId: req.body.userId,
      likes: 0,
    },
  });
  res.status(200).json(postLikes);
}
