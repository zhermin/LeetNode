import { QuestionDataType } from "@/types/question-types";
import { PrismaClient, QuestionDifficulty } from "@prisma/client";

import { CustomEval } from "../src/utils/CustomEval";
import { CustomMath } from "../src/utils/CustomMath";
import { Courses, Questions, Topics } from "./seed_data";

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data (local development only)
  await prisma.question.deleteMany();
  await prisma.questionWithAddedTime.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();

  // Populate the database with the seed data
  await prisma.topic.createMany({
    data: Topics,
  });
  console.log("Topics created");
  await prisma.question.createMany({
    data: Questions,
  });
  console.log("Questions created");

  // Extract the courses without topics from Courses
  const coursesWithoutTopics = Courses.map((course) => {
    const { topics, ...courseWithoutTopics } = course;
    return courseWithoutTopics;
  });

  // Add the Course data and topics separately
  await prisma.course.createMany({
    data: coursesWithoutTopics,
  });

  for (const course of Courses) {
    const { topics } = course;
    const courseTopics = topics.map((topic) => {
      return {
        topicSlug: topic,
      };
    });
    await prisma.course.update({
      where: {
        courseSlug: course.courseSlug,
      },
      data: {
        topics: {
          connect: courseTopics,
        },
      },
    });
  }
  console.log("Courses created");

  // Add 5 random medium questions to the Welcome Quiz for first user found for testing
  // These random question generation for quizzes will be moved to its own functions later
  const user = await prisma.user.findFirst();

  const welcomeQuiz = await prisma.course.findFirst({
    where: { courseSlug: "welcome-quiz" },
  });

  if (user && welcomeQuiz) {
    // Clear user's nusnetId for /welcome page testing
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        nusnetId: null,
      },
    });

    const mediumQuestions = await prisma.question.findMany({
      select: { questionId: true, variationId: true, questionData: true },
      where: { questionDifficulty: QuestionDifficulty.Medium },
    });

    const randomMediumQuestions = CustomMath.nRandomItems(
      1,
      mediumQuestions
    ) as typeof mediumQuestions;
    console.log("Random Medium Questions: ", randomMediumQuestions);

    // Populate and preserve the order of the shuffled question ids using time
    const questionsWithAddedTime = randomMediumQuestions.map(
      (question, index) => {
        const questionData = question.questionData as QuestionDataType;

        let evaluatedQuestionData;
        if (question.variationId === 0) {
          evaluatedQuestionData = CustomEval(
            questionData.variables,
            questionData.methods
          );
        }

        return {
          questionId: question.questionId,
          variationId: question.variationId,
          userId: user.id,
          courseSlug: welcomeQuiz.courseSlug,
          addedTime: new Date(Date.now() + index * 1000),
          variables:
            evaluatedQuestionData?.questionVariables ?? questionData.variables,
          answers: CustomMath.shuffleArray(
            questionData.answers ?? evaluatedQuestionData?.questionAnswers
          ) as QuestionDataType["answers"],
        };
      }
    );

    await prisma.questionWithAddedTime.createMany({
      data: questionsWithAddedTime,
    });

    console.log("Generated Welcome Quiz Questions: ", randomMediumQuestions);

    // Check against the database if we can sort by addedTime
    const questions = await prisma.questionWithAddedTime.findMany({
      where: {
        userId: user.id,
        courseSlug: welcomeQuiz.courseSlug,
      },
      orderBy: {
        addedTime: "asc",
      },
    });

    console.log("Queried Welcome Quiz Questions: ", questions);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
