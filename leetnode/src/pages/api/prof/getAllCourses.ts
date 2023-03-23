import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const getAllCourses = await prisma.course.findMany({
    include: {
      topics: true,
      userCourseQuestions: true,
      posts: true,
      attempts: true,
      courseMedia: true,
    },
  });

  res.status(200).json(getAllCourses);
}
