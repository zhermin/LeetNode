import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  // Questions specific to user and course, newest first
  const userCourseQuestionsWithAddedTime =
    await prisma.questionWithAddedTime.findFirst({
      where: {
        userId: session?.user?.id,
        courseSlug: req.query.courseSlug as string,
      },
      include: {
        question: {
          include: {
            topic: {
              select: {
                topicName: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedTime: "desc",
      },
    });

  res.status(200).json(userCourseQuestionsWithAddedTime);
}
