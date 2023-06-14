import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";

export async function getCourseDetails(courseSlug: string) {
  return await prisma.course.findFirst({
    where: {
      courseSlug: courseSlug,
    },
    include: {
      courseMedia: true,
    },
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

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
              userId: session?.user?.id as string,
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
