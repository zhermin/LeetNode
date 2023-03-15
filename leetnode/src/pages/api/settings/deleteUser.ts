import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  req.body.deleteUser.map(async (userId: string) => {
    const deleteUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json(deleteUser);
  });
}
