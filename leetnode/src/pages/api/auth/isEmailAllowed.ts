import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isEmailAllowed = await prisma.user.findFirst({
    where: {
      email: req.query.email as string,
    },
    select: {
      email: true,
      isNewUser: true,
    },
  });

  res.status(200).json({
    customToast: true,
    emailAllowed: isEmailAllowed !== null,
    isNewUser: isEmailAllowed?.isNewUser,
  });
}
