import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/server/db/client";
import { QuestionDataType } from "@/types/question-types";
import { CustomEval } from "@/utils/CustomEval";
import { CustomMath } from "@/utils/CustomMath";
import { RecommendQuestion } from "@/utils/Recommender";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Questions specific to user and course, newest first
  let userCourseQuestionsWithAddedTime =
    await prisma.questionWithAddedTime.findFirst({
      where: {
        userId: session?.user?.id,
        courseSlug: req.query.courseSlug as string,
      },
      include: {
        question: {
          include: {
            topic: {
              select: {
                topicName: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedTime: "desc",
      },
    });

  // If no questions for this user and for this course yet, recommend a question from the course
  if (!userCourseQuestionsWithAddedTime) {
    const { recommendedTopicName, recommendedQuestion } =
      await RecommendQuestion(req.query.courseSlug as string, 0);

    const questionData = recommendedQuestion.questionData as QuestionDataType;

    let evaluatedQuestionData;
    if (recommendedQuestion.variationId === 0) {
      evaluatedQuestionData = CustomEval(
        questionData.variables,
        questionData.methods
      );
    }

    const recommendedQuestionsWithAddedTime =
      await prisma.questionWithAddedTime.create({
        data: {
          userId: session?.user?.id as string,
          courseSlug: req.query.courseSlug as string,
          questionId: recommendedQuestion.questionId,
          variationId: recommendedQuestion.variationId,
          variables:
            evaluatedQuestionData?.questionVariables ?? questionData.variables,
          answers: CustomMath.shuffleArray(
            questionData.answers ?? evaluatedQuestionData?.questionAnswers
          ) as QuestionDataType["answers"],
        },
      });

    userCourseQuestionsWithAddedTime = {
      ...recommendedQuestionsWithAddedTime,
      question: {
        ...recommendedQuestion,
        topic: {
          topicName: recommendedTopicName,
        },
      },
    };
  }

  res.status(200).json(userCourseQuestionsWithAddedTime);
}
