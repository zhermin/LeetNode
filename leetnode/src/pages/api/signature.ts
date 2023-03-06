import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } else
    try {
      const toSign = `eager=b_rgb:9B9B9B,c_pad,h_150,w_150&folder=profiles&public_id=${req.body.id}&timestamp=${req.body.timestamp}${process.env.CLOUDINARY_SECRET}`;
      const signature = createHash("sha256").update(toSign).digest("hex");
      res.status(200).json({
        signature: signature,
        key: process?.env?.CLOUDINARY_URL?.substring(13, 28),
      });
    } catch (error) {
      res.status(400).json({ message: "Something went wrong" });
    }
}
