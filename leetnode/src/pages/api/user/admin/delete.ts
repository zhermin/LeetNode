import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";
import { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const deletedUserRole = await prisma.user.findFirst({
    where: {
      email: req.query.email as string,
    },
  });

  if (deletedUserRole?.role !== Role.USER) {
    return res.status(403).json({
      message: `Not allowed to delete SUPERUSER or ADMIN, downgrade to USER first`,
    });
  }

  const deletedUser = await prisma.user.delete({
    where: {
      email: req.query.email as string,
    },
  });

  res.status(200).json({
    message: `Email deleted successfully`,
    data: deletedUser,
  });
}
