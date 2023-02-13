import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } else {
    try {
      const info = await prisma.user.findFirst({
        where: {
          id: req.body.id,
        },
        select: {
          nusnetId: true,
          name: true,
          email: true,
          image: true,
        },
      });
      res.status(200).json(info);
    } catch (error) {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}
