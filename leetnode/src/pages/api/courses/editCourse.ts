import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseMediaUpdate = await prisma.course.update({
    where: {
      courseSlug: req.body.courseSlug,
    },
    data: {
      courseDescription: req.body.content.overview,
      video: req.body.content.video,
      markdown: req.body.content.additional,
    },
  });

  const existingMedia = await prisma.courseMedia.findMany({
    where: {
      courseSlug: req.body.courseSlug,
    },
  });

  // Find media that need to be created
  const mediaToCreate = req.body.content.slides.filter(
    (slide: { publicId: string }) =>
      !existingMedia.some((media) => media.publicId === slide.publicId)
  );
  for (const media of mediaToCreate) {
    await prisma.courseMedia.create({
      data: {
        publicId: media.publicId,
        courseSlug: media.courseSlug,
        courseMediaURL: media.courseMediaURL,
        mediaName: media.mediaName,
      },
    });
  }

  // Find media that need to be deleted
  const mediaToDelete = existingMedia.filter(
    (media) =>
      !req.body.content.slides.some(
        (slide: { publicId: string }) => slide.publicId === media.publicId
      )
  );
  for (const media of mediaToDelete) {
    await prisma.courseMedia.delete({
      where: {
        publicId: media.publicId,
      },
    });
  }

  res.status(200).json(courseMediaUpdate);
}
