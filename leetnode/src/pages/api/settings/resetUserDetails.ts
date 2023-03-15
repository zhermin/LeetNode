import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  req.body.editField.map(
    async (userDetail: {
      id: string;
      name: string;
      resetAllAttempts: boolean;
      resetTopicAttempts: string[];
    }) => {
      const changeName = await prisma.user.update({
        where: {
          id: userDetail.id,
        },
        data: {
          name: userDetail.name,
        },
      });

      res.status(200).json(changeName);

      if (userDetail.resetAllAttempts === true) {
        const resetAllAttempts = await prisma.attempt.deleteMany({
          where: {
            userId: userDetail.id,
          },
        });

        res.status(200).json(resetAllAttempts);
      }

      if (userDetail.resetTopicAttempts.length > 0) {
        userDetail.resetTopicAttempts.map(async (topic: string) => {
          const resetTopicAttempts = await prisma.attempt.deleteMany({
            where: {
              userId: userDetail.id,
              question: {
                topic: {
                  topicSlug: topic,
                },
              },
            },
          });
          res.status(200).json(resetTopicAttempts);
        });
      }
    }
  );
}
