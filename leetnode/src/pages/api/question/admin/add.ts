import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";
import { Question } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let addedQuestion: Question;

  if (req.body.baseQuestionId) {
    addedQuestion = await prisma.question.create({
      data: {
        questionId: Number(req.body.baseQuestionId),
        variationId: req.body.variationId,
        topicSlug: req.body.topicSlug,
        questionTitle: req.body.questionTitle,
        questionDifficulty: req.body.questionDifficulty,
        questionContent: req.body.questionContent,
        questionData: req.body.questionData,
      },
    });
  } else {
    addedQuestion = await prisma.question.create({
      data: {
        variationId: req.body.variationId,
        topicSlug: req.body.topicSlug,
        questionTitle: req.body.questionTitle,
        questionDifficulty: req.body.questionDifficulty,
        questionContent: req.body.questionContent,
        questionData: req.body.questionData,
      },
    });
  }

  res.status(201).json({
    message: `Question created successfully`,
    data: addedQuestion,
  });
}
