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

  const courseSlug = req.query.courseSlug as string;

  const course = await prisma.course.findFirst({
    where: {
      courseSlug: courseSlug,
    },
    include: {
      topics: true,
      pages: true,
      userCourseQuestions: {
        where: {
          userId: session?.user?.id,
        },
        include: {
          questionsWithAddedTime: {
            orderBy: {
              addedTime: "asc",
            },
          },
        },
      },
    },
  });

  res.status(200).json(course);
}
