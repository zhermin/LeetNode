import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //check attempt after each submission
  const checkError = await prisma.userCourseQuestion.findUnique({
    where: {
      userId_courseSlug: {
        userId: req.body.id,
        courseSlug: req.body.courseSlug,
      },
    },
  });

  res.status(200).json(checkError);
  res.status(200).json({
    success: "Email sent! ",
  });
}
