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

    // Patch then get data then update mastery
    const patch_res = await axios.patch(
      `${process.env.RECOMMENDER_URL}/update-state/${session?.user?.id}/${
        req.topicSlug
      }/${String(req.correct ? 1 : 0)}`,
      req,
      {
        headers: {
          Accept: "application/json",
          access_token: process.env.RECOMMENDER_API_KEY,
        },
      }
    );

    const info = patch_res.data.Updated;
    console.log(info);

    if (info === true) {
      const get_res = await axios.get(
        `${process.env.RECOMMENDER_URL}/get-mastery/${session?.user?.id}/${req.topicSlug}`,
        {
          headers: {
            Accept: "application/json",
            access_token: process.env.RECOMMENDER_API_KEY,
          },
        }
      );

      const output = get_res.data;
      console.log(output);

      return output;
    } else {
      console.error("Something went wrong");
    }
  };

  const display = await displayData(req.body);

  // Update errorMeter + 1 if false
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
    // Update instead of create (in Mastery table) if exist
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
    // Update instead of create (in Mastery table) if exist
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

  try {
    res.status(200).json(display); // Should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
