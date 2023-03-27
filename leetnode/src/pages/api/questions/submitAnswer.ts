import axios, { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { prisma } from "@/server/db/client";
import { QuestionDataType } from "@/types/question-types";
import { CustomEval } from "@/utils/CustomEval";
import { CustomMath } from "@/utils/CustomMath";
import { RecommendQuestion } from "@/utils/Recommender";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Submit Answer
  // 1. Add a new attempt
  // 2. Update the BKT model and get user's new mastery
  // 3. Recommended question
  //   a. Topic: random topic tested in current course
  //   b. Difficulty: according to new mastery level
  // 4. Add a new questionWithAddedTime with runtime generated answer options
  // 5. Return the new mastery to fire a custom notification

  try {
    const { qatId, userId, courseSlug } = z
      .object({
        qatId: z.string(),
        userId: z.string(),
        courseSlug: z.string(),
      })
      .parse(req.query);

    const { attemptedKeys, isCorrect, topicSlug, topicName } = z
      .object({
        attemptedKeys: z.array(z.string()),
        isCorrect: z.boolean(),
        topicSlug: z.string(),
        topicName: z.string(),
      })
      .parse(req.body);

    // Step 1
    await prisma.attempt.create({
      data: {
        userId: userId,
        courseSlug: courseSlug,
        qatId: qatId,
        attemptedKeys: attemptedKeys,
        isCorrect: isCorrect,
      },
    });

    // Step 2
    const { data: pybktUpdate } = await axios.patch<{
      Updated: boolean;
    }>(
      `https://pybkt-api-deployment.herokuapp.com/update-state/${userId}/${topicSlug}/${String(
        isCorrect ? 1 : 0
      )}`,
      req,
      {
        headers: {
          Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
        },
      }
    );

    if (!pybktUpdate || !pybktUpdate.Updated) {
      throw new Error("PyBKT API update unsuccessful");
    }

    const { data: pybktGet } = await axios.get<{ Mastery: number }>(
      `https://pybkt-api-deployment.herokuapp.com/get-mastery/${userId}/${topicSlug}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
        },
      }
    );

    if (!pybktGet || !pybktGet.Mastery) {
      throw new Error("PyBKT API get unsuccessful");
    }

    console.log(`[${topicSlug}] NEW MASTERY: `, pybktGet.Mastery);

    // Step 3
    const { recommendedTopicSlug, recommendedQuestion } =
      await RecommendQuestion(courseSlug, pybktGet.Mastery);

    console.log(
      `[${recommendedTopicSlug}] RECOMMENDED QUESTION: `,
      recommendedQuestion.questionId
    );

    // Step 4
    const questionData = recommendedQuestion.questionData as QuestionDataType;

    // Only evaluate variables and methods if dynamic question
    let evaluatedQuestionData;
    if (recommendedQuestion.variationId === 0) {
      evaluatedQuestionData = CustomEval(
        questionData.variables,
        questionData.methods
      );
    }

    await prisma.questionWithAddedTime.create({
      data: {
        userId: userId,
        courseSlug: courseSlug,
        questionId: recommendedQuestion.questionId,
        variationId: recommendedQuestion.variationId,
        variables:
          evaluatedQuestionData?.questionVariables ?? questionData.variables,
        answers: CustomMath.shuffleArray(
          questionData.answers ?? evaluatedQuestionData?.questionAnswers
        ) as QuestionDataType["answers"],
      },
    });

    // Step 5
    res.status(200).json({
      message: "Answer submitted successfully",
      topic: topicName,
      masteryLevel: pybktGet.Mastery,
      isCorrect: isCorrect,
      courseSlug: courseSlug,
    });
  } catch (e) {
    res.status(400).json({
      message:
        e instanceof z.ZodError || e instanceof AxiosError || e instanceof Error
          ? e.message
          : "Failed to submit answer due to unknown error",
    });
  }
}
