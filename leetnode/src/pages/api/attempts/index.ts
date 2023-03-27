import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";

import { prisma } from "@/server/db/client";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);

    const courseSlug = z.string().nonempty().parse(req.query.course);

    const attempts = await prisma.attempt.findMany({
      where: {
        userId: session?.user?.id,
        courseSlug: courseSlug,
      },
      include: {
        questionWithAddedTime: {
          include: {
            question: {
              include: {
                topic: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    res.status(200).json(attempts);
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      res.status(400).json({ message: e.message });
    } else {
      res.status(500).json({ message: "Failed to retrieve user's attempts" });
    }
  }
}
