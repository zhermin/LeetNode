// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await createQuestion(req, res)
  } else if (req.method === 'GET') {
    return await questionTopics(req, res);
  }
  else {
    return res.status(405).json({ message: 'Method not allowed', success: false })
  }
}

//GET question topics
async function questionTopics(req, res) {
  const body = req.body
  try {
    const newEntry = await prisma.topics.findMany({
      data: {
        topicID: body.topicID,
        topicName: body.topicName,
        topicLevel: body.topicLevel,
      }
    })
    return res.status(200).json(newEntry, { success: true })
  } catch (error) {
    console.error('Request error', error)
    res.status(500).json({ error: 'Error creating question', success: false })
  }
}

//prof creating question
async function createQuestion(req, res) {
  const body = req.body
  try {
    const newEntry = await prisma.questions.create({
      data: {
        topicID: body.topicID,
        questionContent: body.questionContent,
        questionDifficulty: body.questionDifficulty,
        topics: body.topics
      }
    })
    return res.status(200).json(newEntry, { success: true })
  } catch (error) {
    console.error('Request error', error)
    res.status(500).json({ error: 'Error creating question', success: false })
  }
}

//student submitting answer
async function submitAnswer(req, res) {
  try {
    const answerEntry = await prisma.answers.findMany({
      data: {
        name: body.firstName,
        email: body.email,
        subject: body.subject,
        message: body.message
      }
    })
    return res.status(200).json(answerEntry, { success: true })
  } catch (error) {
    console.error('Request error', error)
    res.status(500).json({ error: 'Error submitting answer', success: false })
  }
}
