const { PrismaClient } = require('@prisma/client');
const { topics, questions, answers, questionMedia } = require('./data.js');
const prisma = new PrismaClient();

const load = async () => {
  try {

    // FOR DELETING EXISTING TABLE
    await prisma.topics.deleteMany();
    console.log('Deleted records in topics table');
    await prisma.questions.deleteMany();
    console.log('Deleted records in questions table');
    await prisma.answers.deleteMany();
    console.log('Deleted records in answers table');
    await prisma.questionMedia.deleteMany();
    console.log('Deleted records in questionMedia table');

    
    
    await prisma.topics.createMany({
      data: topics
    });
    console.log('Topics are created')

    await prisma.questions.createMany({
      data: questions,
    });
    console.log('Questions are created')

    await prisma.answers.createMany({
      data: answers,
    });
    console.log('Answers are created')

    await prisma.questionMedia.createMany({
      data: questionMedia,
    });
    console.log('Question Media is created')

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
};

load();