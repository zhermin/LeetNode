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
  const emails: string[] = req.body.emails;
  if (emails.includes(session?.user?.email as string)) {
    return res.status(403).json({
      message: `Not allowed to delete yourself`,
    });
  }

  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: emails,
        },
        AND: {
          role: {
            not: Role.SUPERUSER,
          },
          OR: {
            role: {
              not: Role.ADMIN,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting users" });
  }

  res.status(200).json({
    message: "Users deleted successfully (admins ignored)",
  });
}
