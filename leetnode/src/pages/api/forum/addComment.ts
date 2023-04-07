import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  await prisma.comment.create({
    data: {
      postId: req.body.postId,
      userId: session?.user?.id as string,
      message: req.body.message,
    },
  });

  res.status(200).json({ message: "Comment created successfully!" });
}
