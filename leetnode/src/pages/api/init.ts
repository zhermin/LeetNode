import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/server/db/client";

import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // TODO: NUSNET ID must be unique, also allow add nickname
  // GET request to check if the user has already been initialized
  if (req.method === "GET") {
    const nusnetId = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
      select: {
        nusnetId: true,
      },
    });

    res.status(200).json({
      message: "User already initialized",
      nusnetId: nusnetId?.nusnetId,
    });
  }

  // POST request to add nusnetId and nickname for user
  if (req.method === "POST") {
    const nusnetId = req.body.nusnetId;

    // Update user with nusnetId
    await prisma.user.update({
      where: {
        id: session?.user?.id,
      },
      data: {
        nusnetId: nusnetId,
      },
    });

    res.status(200).json({ message: "Welcome to LeetNode!" });
  }
}
