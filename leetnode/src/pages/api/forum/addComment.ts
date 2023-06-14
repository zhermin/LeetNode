import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  await prisma.comment.create({
    data: {
      postId: req.body.postId,
      userId: session?.user?.id as string,
      message: req.body.message,
    },
  });

  res.status(200).json({ message: "Comment created successfully!" });
}
