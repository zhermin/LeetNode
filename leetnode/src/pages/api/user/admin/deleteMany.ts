import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const emails: string[] = req.body.emails;

  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting users" });
  }

  res.status(200).json({
    message: "Users deleted successfully",
  });
}
