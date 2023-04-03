import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getSession } from "next-auth/react";

import { prisma } from "@/server/db/client";
import { Mastery } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  const displayData = async (req: {
    topicSlug: string;
    correct: boolean;
    optionNumber: number;
    questionId: number;
    masteryConditionFlag: boolean;
    courseSlug: string;
  }) => {
    console.log(req.topicSlug);
    // //check if masteryLevel === 0 =>
    // axios
    //   .get(
    //     `https://pybkt-api-deployment.herokuapp.com/get-mastery/${req.id}/${req.topicSlug}/`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
    //       },
    //     }
    //   )
    //   .catch(function (error) {
    //     console.log("reached error");
    //     if (
    //       error.response.data.detail === `Student ID ${req.id} does NOT exists`
    //     ) {
    //       axios.post(
    //         `https://pybkt-api-deployment.herokuapp.com/add-student/${req.id}/${req.topicSlug}/`,
    //         {
    //           headers: {
    //             Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
    //           },
    //         }
    //       );
    //     }
    //   });

    //patch then get data then update mastery
    const res = await axios.patch(
      `https://pybkt-api-deployment.herokuapp.com/update-state/${
        session?.user?.id
      }/${req.topicSlug}/${String(req.correct ? 1 : 0)}`,
      req,
      {
        headers: {
          Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
        },
      }
    );

    const info = res.data.Updated;
    console.log(info);

    if (info === true) {
      const res2 = await axios.get(
        `https://pybkt-api-deployment.herokuapp.com/get-mastery/${session?.user?.id}/${req.topicSlug}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
          },
        }
      );
      console.log(res2.data);
      const output = res2.data;

      return output;
    } else {
      console.log("something went wrong");
    }
  };

  const display = await displayData(req.body);

  //update errorMeter + 1 if false
  if (req.body.correct === false) {
    const wrongness = await prisma.mastery.update({
      where: {
        userId_topicSlug: {
          userId: req.body.id as string,
          topicSlug: req.body.topicSlug as string,
        },
      },
      data: {
        errorMeter: {
          increment: 1,
        },
      },
    });
    console.log(wrongness);
  }

  if (req.body.masteryConditionFlag === true) {
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
        topicPing: req.body.masteryConditionFlag as boolean,
      },
      create: {
        userId: req.body.id as string,
        topicSlug: req.body.topicSlug as string,
        masteryLevel: display.Mastery,
      },
    });
    console.log(mastery);
  } else {
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
  }

  // //updates attempt after each submission
  // const updateAttempt = await prisma.attempt.create({
  //   data: {
  //     userId: req.body.id,
  //     questionId: req.body.questionId,
  //     attemptOption: req.body.optionNumber,
  //     isCorrect: req.body.correct,
  //   },
  // });
  // console.log(updateAttempt.attemptId);

  try {
    res.status(200).json(display); // should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
