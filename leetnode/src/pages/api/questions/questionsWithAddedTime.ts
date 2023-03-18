import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const reqvar = req.body["courseSlug"];

  //should only have one return nested json result
  const courseContent = await prisma.userCourseQuestion.findMany({
    where: {
      courseSlug: reqvar,
    },
    include: {
      questionsWithAddedTime: {
        include: {
          question: {
            include: {
              questionMedia: true,
              topic: true,
              attempts: {
                where: {
                  userId: session?.user?.id,
                },
                orderBy: {
                  submittedAt: "desc",
                },
              },
              answers: true,
            },
          },
        },
      },
    },
  });
  console.log(courseContent);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json(courseContent);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
