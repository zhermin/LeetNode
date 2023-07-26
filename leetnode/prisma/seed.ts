import { PrismaClient } from "@prisma/client";

import { Courses, Questions, Topics } from "./seed_data";

const prisma = new PrismaClient();

async function main() {
  await prisma.question.deleteMany();
  await prisma.questionWithAddedTime.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();

  await prisma.topic.createMany({
    data: Topics,
  });
  console.log("Topics created");
  await prisma.question.createMany({
    data: Questions,
  });
  console.log("Questions created");

  const coursesWithoutTopics = Courses.map((course) => {
    const { topics, ...courseWithoutTopics } = course;
    return courseWithoutTopics;
  });
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
