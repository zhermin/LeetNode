import { prisma } from "@/server/db/client";
import { Question, QuestionDifficulty, Topic } from "@prisma/client";

import { CustomMath } from "./CustomMath";

export const RecommendQuestion = async (
  courseSlug: string,
  masteryLevel: number
) => {
  const relevantTopics = await prisma.course.findFirst({
    where: {
      courseSlug: courseSlug,
    },
    select: {
      topics: {
        select: {
          topicSlug: true,
          topicName: true,
        },
      },
    },
  });

  if (!relevantTopics) {
    throw new Error("Course has no relevant topics");
  }

  const recommendedTopicSlug = (
    CustomMath.nRandomItems(1, relevantTopics.topics)[0] as Topic
  ).topicSlug;

  console.log(`[${courseSlug}] RECOMMENDED TOPIC: `, recommendedTopicSlug);

  let recommendedDifficulty: QuestionDifficulty;
  if (masteryLevel <= 0.4) {
    recommendedDifficulty =
      Math.random() < 0.75
        ? QuestionDifficulty.Easy
        : QuestionDifficulty.Medium;
  } else if (masteryLevel <= 0.7) {
    recommendedDifficulty =
      Math.random() < 0.25
        ? QuestionDifficulty.Easy
        : Math.random() < 0.5
        ? QuestionDifficulty.Medium
        : QuestionDifficulty.Hard;
  } else {
    recommendedDifficulty =
      Math.random() < 0.75
        ? QuestionDifficulty.Hard
        : QuestionDifficulty.Medium;
  }

  console.log(
    `[${courseSlug}] RECOMMENDED DIFFICULTY (${masteryLevel * 100}%): `,
    recommendedDifficulty
  );

  let relevantQuestions = await prisma.question.findMany({
    where: {
      topicSlug: recommendedTopicSlug,
      questionDifficulty: recommendedDifficulty,
    },
  });

  // TODO: Change this fallback
  if (relevantQuestions.length === 0) {
    console.warn(
      `[${recommendedTopicSlug}] No questions with difficulty ${recommendedDifficulty}, falling back to random`
    );
    relevantQuestions = await prisma.question.findMany({
      where: {
        topicSlug: recommendedTopicSlug,
      },
    });
  }

  const recommendedQuestion = CustomMath.nRandomItems(
    1,
    relevantQuestions
  )[0] as Question;

  if (!recommendedQuestion) {
    throw new Error("No relevant questions found");
  }

  return {
    recommendedTopicSlug,
    recommendedQuestion,
  };
};
