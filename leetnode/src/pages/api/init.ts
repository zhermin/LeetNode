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

  // TODO: NUSNET ID must be unique, also allow add nickname
  // GET request to check if the user has already been initialized
  if (req.method === "GET") {
    const nusnetId = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
      select: {
        nusnetId: true,
      },
    });

    res.status(200).json({
      message: "User already initialized",
      nusnetId: nusnetId?.nusnetId,
    });
  }

  // POST request to add nusnetId into user and initialize userCourseQuestions and Mastery
  if (req.method === "POST") {
    const nusnetId = req.body.nusnetId;

    // Update user with nusnetId
    await prisma.user.update({
      where: {
        id: session?.user?.id,
      },
      data: {
        nusnetId: nusnetId,
      },
    });

    // TODO: Remove userCourseQuestion
    // Initialize the userCourseQuestions for all courses for the user
    const courses = await prisma.course.findMany();
    const userCourseQuestions = courses.map((course) => {
      return {
        userId: session?.user?.id as string,
        courseSlug: course.courseSlug,
      };
    });
    await prisma.userCourseQuestion.createMany({
      data: userCourseQuestions,
    });

    res.status(200).json({ message: "Welcome to LeetNode!" });
  }
}
