import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
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
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const courses = await getData();

  res.status(200).json(courses);
}
