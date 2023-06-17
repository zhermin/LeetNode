import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";
import { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.email === req.query.email) {
    return res.status(403).json({
      message: `Not allowed to delete yourself`,
    });
  }

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
