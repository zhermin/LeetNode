import { NextApiRequest, NextApiResponse } from "next";
// import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const session = await getSession({ req });
  // if (!session) {
  //   res.status(401).json({ message: "Unauthorized" });
  //   return;
  // }

  //check attempt after each submission
  const checkAttempts = await prisma.attempt.findMany({
    where: {
      userId: req.body.id,
      question: {
        topicSlug: req.body.topicSlug,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  res.status(200).json(checkAttempts);
}
