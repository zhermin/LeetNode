import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

export async function getData() {
  return await prisma.course.findMany({
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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courses = await getData();
  res.status(200).json(courses);
}
