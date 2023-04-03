import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

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
  const session = await unstable_getServerSession(req, res, authOptions);

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
