import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  await prisma.post.update({
    where: {
      postId: req.body.postId,
    },
    data: {
      likes: req.body.newLikes,
    },
  });

  const postLikes = await prisma.postLikes.upsert({
    where: {
      postId_userId: {
        postId: req.body.postId,
        userId: session?.user?.id as string,
      },
    },
    create: {
      postId: req.body.postId,
      userId: session?.user?.id as string,
      likes: req.body.likes,
    },
    update: {
      likes: req.body.likes,
    },
  });

  res.status(200).json(postLikes);
}
