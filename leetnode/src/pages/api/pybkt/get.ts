import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const displayMastery = async (req: { id: string; topicSlug: string }) => {
  //   try {
  //     //get mastery of student
  //     const res = await axios.get(
  //       `https://pybkt-api-deployment.herokuapp.com/get-mastery/${req.id}/${req.topicSlug}`
  //     );
  //     return res.data;
  //     //use data destructuring to get data from the promise object
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const response = await displayMastery(req.body);

  const getMastery = await prisma.mastery.findUnique({
    where: {
      userId_topicSlug: {
        userId: req.body.id,
        topicSlug: req.body.topicSlug,
      },
    },
  });
  console.log(getMastery?.masteryLevel);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json(getMastery?.masteryLevel);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
