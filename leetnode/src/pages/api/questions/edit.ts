import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";
import { Question } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let editedQuestion: Question;

  // If updating question from static to dynamic or vice versa
  if (
    req.body.newQuestionId === null ||
    (Number(req.query.variationId as string) !==
      Number(req.body.newVariationId as string) &&
      Number(req.body.newVariationId as string) === 0)
  ) {
    editedQuestion = await prisma.question.create({
      data: {
        variationId: Number(req.body.newVariationId as string),
        topicSlug: req.body.topicSlug,
        questionTitle: req.body.questionTitle,
        questionDifficulty: req.body.questionDifficulty,
        questionContent: req.body.questionContent,
        questionData: req.body.questionData,
      },
    });

    await prisma.question.delete({
      where: {
        questionId_variationId: {
          questionId: Number(req.query.questionId as string),
          variationId: Number(req.query.variationId as string),
        },
      },
    });
  // If tagging a static question to a base question
  } else if (req.body.newQuestionId && req.body.newVariationId) {
    editedQuestion = await prisma.question.update({
      where: {
        questionId_variationId: {
          questionId: Number(req.query.questionId as string),
          variationId: Number(req.query.variationId as string),
        },
      },
      data: {
        questionId: Number(req.body.newQuestionId),
        variationId: Number(req.body.newVariationId),
        topicSlug: req.body.topicSlug,
        questionTitle: req.body.questionTitle,
        questionDifficulty: req.body.questionDifficulty,
        questionContent: req.body.questionContent,
        questionData: req.body.questionData,
      },
    });
  // If simply updating a question without changing its type
  } else {
    editedQuestion = await prisma.question.update({
      where: {
        questionId_variationId: {
          questionId: Number(req.query.questionId as string),
          variationId: Number(req.query.variationId as string),
        },
      },
      data: {
        topicSlug: req.body.topicSlug,
        questionTitle: req.body.questionTitle,
        questionDifficulty: req.body.questionDifficulty,
        questionContent: req.body.questionContent,
        questionData: req.body.questionData,
      },
    });
  }

  res.status(200).json({
    message: `Question updated successfully`,
    data: editedQuestion,
  });
}
