import { PrismaClient } from "@prisma/client";
import { Topic, Question, Answer, QuestionMedia } from "./seed_data";

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data (local development only)
  await prisma.question.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.questionMedia.deleteMany();
  await prisma.topic.deleteMany();

  // Populate the database with the seed data
  await prisma.topic.createMany({
    data: Topic,
  });
  console.log("Topics created");
  await prisma.question.createMany({
    data: Question,
  });
  console.log("Questions created");
  await prisma.answer.createMany({
    data: Answer,
  });
  console.log("Answers created");
  await prisma.questionMedia.createMany({
    data: QuestionMedia,
  });
  console.log("Question Media created");
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
