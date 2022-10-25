import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const courses = await prisma.course.findMany({
    include: {
      topics: {
        select: { topicSlug: true },
      },
    },
    orderBy: [
      {
        week: "asc",
      },
      {
        studio: "asc",
      },
    ],
  });

  res.status(200).json(courses);
}
