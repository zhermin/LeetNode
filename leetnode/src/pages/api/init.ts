import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import { prisma } from "@/server/db/client";
import { QuestionDataType } from "@/types/question-types";
import { CustomEval } from "@/utils/CustomEval";
import { CustomMath } from "@/utils/CustomMath";

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

    // Get all topics
    const topics = await prisma.topic.findMany();

    // Initialize the default mastery for all topics for the user
    const defaultMasteries = topics.map((topic) => {
      return {
        userId: session?.user?.id as string,
        topicSlug: topic.topicSlug,
      };
    });
    await prisma.mastery.createMany({
      data: defaultMasteries,
    });

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

    // For now, initialize a random question for each course in userCourseQuestions
    const allQuestions = await prisma.question.findMany({
      select: {
        questionId: true,
        variationId: true,
        questionData: true,
      },
    });

    await prisma.questionWithAddedTime.createMany({
      data: userCourseQuestions.map((userCourseQuestion) => {
        const randomIdx = Math.floor(Math.random() * allQuestions.length);
        const randomQuestion = allQuestions[randomIdx];
        const randomQuestionData =
          randomQuestion?.questionData as QuestionDataType;

        let evaluatedQuestionData;
        if (randomQuestion?.variationId === 0) {
          evaluatedQuestionData = CustomEval(
            randomQuestionData.variables,
            randomQuestionData.methods
          );
        }

        return {
          questionId: randomQuestion?.questionId as number,
          variationId: randomQuestion?.variationId as number,
          userId: session?.user?.id as string,
          courseSlug: userCourseQuestion.courseSlug,
          variables:
            evaluatedQuestionData?.questionVariables ??
            randomQuestionData.variables,
          answers: CustomMath.shuffleArray(
            randomQuestionData.answers ?? evaluatedQuestionData?.questionAnswers
          ) as QuestionDataType["answers"],
        };
      }),
    });

    res.status(200).json({ message: "Welcome to LeetNode!" });
  }
}
