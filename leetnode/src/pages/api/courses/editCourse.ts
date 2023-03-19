import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const json: {
    overview: string;
    slides: string;
    video: string;
    additional: string;
  } = {
    overview: req.body.content.overview,
    slides: req.body.content.slides,
    video: req.body.content.video,
    additional: req.body.content.additional,
  };
  const comments = await prisma.course.update({
    where: {
      courseSlug: req.body.courseSlug,
    },
    data: {
      learnTabJson: json,
    },
  });

  res.status(200).json(comments);
}
