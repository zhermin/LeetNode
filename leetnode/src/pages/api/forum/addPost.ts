import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  await prisma.post.create({
    data: {
      userId: session?.user?.id as string,
      title: req.body.title,
      message: req.body.message,
      courseName: req.body.courseName,
      postType: req.body.postType,
    },
  });

  res.status(200).json({ message: "Post created successfully!" });
}
