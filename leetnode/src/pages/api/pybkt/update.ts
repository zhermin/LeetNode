import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { prisma } from "@/server/db/client";
import { Mastery } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const displayData = async (req: {
    id: string;
    topicSlug: string;
    correct: boolean;
    optionNumber: number;
    questionId: number;
  }) => {
    //check if masteryLevel === 0 =>
    axios
      .get(
        `https://pybkt-api-deployment.herokuapp.com/get-mastery/${req.id}/${req.topicSlug}/`
      )
      .catch(function (error) {
        if (
          error.response.data.detail === `Student ID ${req.id} does NOT exists`
        ) {
          axios.post(
            `https://pybkt-api-deployment.herokuapp.com/add-student/${req.id}/${req.topicSlug}/`
          );
        }
      });

    //patch then get data then update mastery
    const res = await axios.patch(
      `https://pybkt-api-deployment.herokuapp.com/update-state/${req.id}/${
        req.topicSlug
      }/${String(req.correct ? 1 : 0)}`,
      req
    );

    const info = res.data.Updated;
    console.log(info);

    if (info === true) {
      const res2 = await axios.get(
        `https://pybkt-api-deployment.herokuapp.com/get-mastery/${req.id}/${req.topicSlug}`
      );
      console.log("reached res2");
      console.log(res2.data);
      const output = res2.data;

      return output;
    } else {
      console.log("something went wrong");
    }
  };

  const display = await displayData(req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // update instead of create (in Mastery table) if exist
  const mastery: Mastery = await prisma.mastery.upsert({
    where: {
      userId_topicSlug: {
        userId: req.body.id as string,
        topicSlug: req.body.topicSlug as string,
      },
    },
    update: {
      masteryLevel: display.Mastery,
    },
    create: {
      userId: req.body.id as string,
      topicSlug: req.body.topicSlug as string,
      masteryLevel: display.Mastery,
    },
  });
  console.log(mastery);

  //updates attempt after each submission
  const updateAttempt = await prisma.attempt.create({
    data: {
      userId: req.body.id,
      questionId: req.body.questionId,
      attemptOption: req.body.optionNumber,
      isCorrect: req.body.correct,
    },
  });
  console.log(updateAttempt.attemptId);

  try {
    res.status(200).json(display); // should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
