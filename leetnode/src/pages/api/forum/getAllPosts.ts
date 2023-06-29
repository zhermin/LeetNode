import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          username: true,
          image: true,
          role: true,
        },
      },
      course: true,
      comment: {
        include: {
          user: {
            select: {
              username: true,
              image: true,
              role: true,
            },
          },
        },
      },
      postLikes: true,
    },
  });

  res.status(200).json(posts);
}
