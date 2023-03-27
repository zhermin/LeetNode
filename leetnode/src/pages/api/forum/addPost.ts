import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const posts = await prisma.post.create({
    data: {
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      courseName: req.body.courseName,
      postType: req.body.postType,
    },
  });

  res.status(200).json(posts);
}
