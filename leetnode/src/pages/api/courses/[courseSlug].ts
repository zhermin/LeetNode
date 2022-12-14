import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "@/server/db/client";

export async function getCourseDetails(courseSlug: string) {
  return await prisma.course.findFirst({
    where: {
      courseSlug: courseSlug,
    },
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const courseDetails = await getCourseDetails(req.query.courseSlug as string);

  const userCourseInfo = await prisma.course.findFirst({
    where: {
      courseSlug: req.query.courseSlug as string,
    },
    select: {
      topics: {
        include: {
          mastery: {
            where: {
              userId: session?.user?.id,
            },
          },
        },
      },
      userCourseQuestions: {
        where: {
          userId: session?.user?.id,
        },
        include: {
          questionsWithAddedTime: {
            include: {
              question: {
                include: {
                  answers: true,
                  attempts: {
                    where: {
                      userId: session?.user?.id,
                    },
                    orderBy: {
                      submittedAt: "desc",
                    },
                  },
                  topic: true,
                  questionMedia: true,
                },
              },
            },
            orderBy: {
              addedTime: "asc",
            },
          },
        },
      },
    },
  });

  const course = {
    ...courseDetails,
    ...userCourseInfo,
  };

  res.status(200).json(course);
}
