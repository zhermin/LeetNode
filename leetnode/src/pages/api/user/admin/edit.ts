import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";
import { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (
      session?.user?.role !== Role.SUPERUSER &&
      req.body.role === Role.SUPERUSER
    ) {
      return res.status(403).json({
        message: `Not allowed to upgrade to SUPERUSER`,
      });
    }

    if (
      session?.user?.email === req.query.email &&
      session?.user?.role !== req.body.role
    ) {
      return res.status(403).json({
        message: `Not allowed to change your own role`,
      });
    }

    await prisma.user.update({
      where: {
        email: req.query.email as string,
      },
      data: {
        username: req.body.username,
        role: req.body.role,
        points: parseInt(req.body.points),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating user" });
  }

  res.status(200).json({
    message: "User updated successfully",
  });
}
