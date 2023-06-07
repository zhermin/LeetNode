import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/server/db/client";

import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const allAttempts = await prisma.attempt.findMany({
    include: {
      user: true,
      questionWithAddedTime: {
        include: {
          question: {
            include: {
              topic: true,
            },
          },
          attempts: {
            where: {
              userId: session?.user?.id,
            },
            orderBy: {
              submittedAt: "desc",
            },
          },
        },
      },
      course: true,
    },
  });

  res.status(200).json(allAttempts);
}
