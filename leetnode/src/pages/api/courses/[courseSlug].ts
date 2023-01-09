import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "@/server/db/client";

export async function getData(courseSlug: string, id: string) {
  return await prisma.course.findFirst({
    where: {
      courseSlug: courseSlug,
    },
    include: {
      topics: {
        include: {
          mastery: {
            where: {
              userId: id,
            },
          },
        },
      },
      userCourseQuestions: {
        where: {
          userId: id,
        },
        include: {
          questionsWithAddedTime: {
            include: {
              question: {
                include: {
                  answers: true,
                  attempts: {
                    where: {
                      userId: id,
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

  const courseSlug = req.query.courseSlug as string;
  const course = getData(courseSlug, session.user?.id as string);

  res.status(200).json(course);
}
