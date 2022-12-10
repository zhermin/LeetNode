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

  await prisma.post.update({
    where: {
      postId: req.body.postId,
    },
    data: {
      likes: req.body.newLikes,
    },
  });

  const postLikes = await prisma.postLikes.update({
    where: {
      postId_userId: {
        postId: req.body.postId,
        userId: req.body.userId,
      },
    },
    data: {
      likes: req.body.likes,
    },
  });

  res.status(200).json(postLikes);
}
