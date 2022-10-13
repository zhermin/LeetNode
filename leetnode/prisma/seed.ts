import { PrismaClient, QuestionDifficulty } from "@prisma/client";
import {
  Topics,
  Courses,
  Questions,
  Answers,
  QuestionMedias,
} from "./seed_data";

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data (local development only)
  await prisma.question.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.questionMedia.deleteMany();
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
  await prisma.answer.createMany({
    data: Answers,
  });
  console.log("Answers created");
  await prisma.questionMedia.createMany({
    data: QuestionMedias,
  });
  console.log("Question Media created");
  await prisma.course.createMany({
    data: Courses,
  });
  console.log("Courses created");

  // Add the Welcome Quiz
  await prisma.course.create({
    data: {
      courseSlug: "welcome-quiz",
      courseName: "Welcome Quiz",
    },
  });
  console.log("Welcome Quiz created");

  // Add 5 random medium questions to the Welcome Quiz for first user found for testing
  // These random question generation for quizzes will be moved to its own functions later
  const user = await prisma.user.findFirst();

  if (user) {
    const mediumQuestionIds = Questions.filter(
      (question) => question.questionDifficulty === QuestionDifficulty.Medium
    ).map((question) => question.questionId);

    const randomMediumQuestionIds = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * mediumQuestionIds.length);
      randomMediumQuestionIds.push(mediumQuestionIds[randomIndex]);
      mediumQuestionIds.splice(randomIndex, 1);
    }

    await prisma.userCourseQuestion.create({
      data: {
        userId: user.id,
        courseSlug: "welcome-quiz",
        questions: {
          connect: randomMediumQuestionIds.map((questionId) => ({
            questionId: questionId,
          })),
        },
      },
    });

    console.log("Welcome Quiz questions added for first user found");
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
