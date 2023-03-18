import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  const getAllAttempts = await prisma.attempt.findMany({
    include: {
      user: true,
      question: {
        include: {
          questionMedia: true,
          topic: true,
          attempts: {
            where: {
              userId: session?.user?.id,
            },
            orderBy: {
              submittedAt: "desc",
            },
          },
          answers: true,
        },
      },
      answer: true,
      course: true,
    },
  });

  res.status(200).json(getAllAttempts);
}
