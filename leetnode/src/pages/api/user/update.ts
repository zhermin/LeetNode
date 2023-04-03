import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } else {
    try {
      const info = await prisma.user.update({
        where: {
          id: req.body.id,
        },
        data: {
          nusnetId: req.body.nusnetId,
          nickname: req.body.nickname,
          image: req.body.image,
        },
      });
      res.status(200).json(info);
    } catch (error) {
      console.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res.status(400).json({
            message: "Nickname or NUSNET ID already exists",
          });
        }
      } else {
        res.status(400).json({
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }
}
