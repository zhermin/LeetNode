const { PrismaClient } = require('@prisma/client');
const { Topic, Question, Answer, QuestionMedia } = require('./data.js');
const prisma = new PrismaClient();

const load = async () => {
  try {

    //FOR DELETING EXISTING TABLE
    await prisma.questionMedia.deleteMany();
    console.log('Deleted records in questionMedia table');
    await prisma.question.deleteMany();
    console.log('Deleted records in questions table');
    await prisma.topic.deleteMany();
    console.log('Deleted records in topics table');
    await prisma.answer.deleteMany();
    console.log('Deleted records in answers table');
    

    await prisma.question.createMany({
      data: Question,
    });
    console.log('Questions are created')

    await prisma.answer.createMany({
      data: Answer,
    });
    console.log('Answers are created')

    await prisma.questionMedia.createMany({
      data: QuestionMedia,
    });
    console.log('Question Media is created')

    await prisma.topic.createMany({
      data: Topic,
    });
    console.log('Topics are created')

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
};

load();