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

    // // Get all topics
    // const topics = await prisma.topic.findMany();

    // // Initialize the default mastery for all topics for the user
    // const defaultMasteries = topics.map((topic) => {
    //   return {
    //     userId: session?.user?.id as string,
    //     topicSlug: topic.topicSlug,
    //   };
    // });
    // console.log(defaultMasteries);
    // await prisma.mastery.createMany({
    //   data: defaultMasteries,
    // });

    // Initialize the userCourseQuestions for all courses for the user
    const courses = (await prisma.course.findMany()).filter(
      (course) => course.courseSlug !== "welcome-quiz"
    );
    const userCourseQuestions = courses.map((course) => {
      return {
        userId: session?.user?.id as string,
        courseSlug: course.courseSlug,
      };
    });
    await prisma.userCourseQuestion.createMany({
      data: userCourseQuestions,
    });

    // For now, initialize a random question for each course in userCourseQuestions
    const questionIds = await prisma.question.findMany({
      select: { questionId: true },
    });
    await prisma.questionWithAddedTime.createMany({
      data: userCourseQuestions.map((userCourseQuestion) => {
        return {
          questionId:
            questionIds[Math.floor(Math.random() * questionIds.length)]
              ?.questionId ?? 1,
          userId: session?.user?.id as string,
          courseSlug: userCourseQuestion.courseSlug,
        };
      }),
    });

    res.status(200).json({ message: "Welcome to LeetNode!" });
  }
}
