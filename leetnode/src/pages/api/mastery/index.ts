import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const { data } = await axios.get<{ Mastery: Record<string, number> }>(
    `https://pybkt-api-deployment.herokuapp.com/get-all/${session?.user?.id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
      },
    }
  );

  const masteryExternal = Object.entries(data.Mastery);
  await Promise.all(
    masteryExternal.map(([topicSlug, masteryLevel]) =>
      prisma.mastery.upsert({
        where: {
          userId_topicSlug: {
            userId: session?.user?.id as string,
            topicSlug: topicSlug,
          },
        },
        update: {
          masteryLevel: masteryLevel,
        },
        create: {
          userId: session?.user?.id as string,
          topicSlug: topicSlug,
          masteryLevel: masteryLevel,
        },
      })
    )
  );

  if (!masteryExternal) {
    console.error(
      "Error fetching mastery from PyBKT API, falling back to internal mastery data"
    );
    const masteryInternal = await prisma.mastery.findMany({
      where: {
        userId: session?.user?.id,
      },
    });

    const masteryInternalResponse = masteryInternal.reduce(
      (acc, { topicSlug, masteryLevel }) => {
        acc[topicSlug] = masteryLevel;
        return acc;
      },
      {} as Record<string, number>
    );

    res.status(200).json(masteryInternalResponse);
  }

  res.status(200).json(data.Mastery);
}
