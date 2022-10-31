import { PrismaClient, QuestionDifficulty } from "@prisma/client";
import {
  Topics,
  Courses,
  Questions,
  Answers,
  QuestionMedias,
} from "./seed_data";

const prisma = new PrismaClient();

// shuffle the question ids
function shuffleArray(array: { questionId: number }[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]] as [
      typeof array[0],
      typeof array[0]
    ];
  }
  return array.map((q) => q.questionId);
}

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

  // Extract the courses without topics from Courses
  const coursesWithoutTopics = Courses.map((course) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Clear user's nusnetId for /welcome page testing
  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      nusnetId: null,
    },
  });

  const welcomeQuiz = await prisma.course.findFirst({
    where: { courseSlug: "welcome-quiz" },
  });

  // Shuffle the question ids
  const mediumQuestionIds = shuffleArray(
    await prisma.question.findMany({
      select: { questionId: true },
      where: { questionDifficulty: QuestionDifficulty.Medium },
    })
  );

  if (user && welcomeQuiz) {
    // Add the user's userCourseQuestion
    await prisma.userCourseQuestion.createMany({
      data: {
        userId: user.id,
        courseSlug: welcomeQuiz.courseSlug,
      },
    });

    const randomMediumQuestionIds: number[] = [];
    for (let i = 0; i < 5; i++) {
      randomMediumQuestionIds.push(mediumQuestionIds[i] as number);
    }

    // Populate and preserve the order of the shuffled question ids using time
    const questionsWithAddedTime = randomMediumQuestionIds.map(
      (questionId, index) => {
        return {
          questionId,
          userId: user.id,
          courseSlug: welcomeQuiz.courseSlug,
          addedTime: new Date(Date.now() + index * 1000),
        };
      }
    );
    await prisma.questionWithAddedTime.createMany({
      data: questionsWithAddedTime,
    });

    console.log("Generated Welcome Quiz Questions: ", randomMediumQuestionIds);

    // Check against the database if we can sort by addedTime
    const questions = await prisma.userCourseQuestion.findFirst({
      where: {
        userId: user.id,
        courseSlug: welcomeQuiz.courseSlug,
      },
      include: {
        questionsWithAddedTime: {
          orderBy: {
            addedTime: "asc",
          },
        },
      },
    });

    console.log(
      "Queried Welcome Quiz Questions: ",
      questions?.questionsWithAddedTime
    );
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
