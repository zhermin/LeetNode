import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/server/db/client";

const nodemailer = require("nodemailer");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  // if (!session) {
  //   res.status(401).json({ message: "Unauthorized" });
  //   return;
  // }

  console.log("start nodemailer");
  // Create a transporter for sending the email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    //need to put email in .env file in the future
    auth: {
      user: "contact.leetnode@gmail.com",
      pass: process.env.GMAIL_PASS,
    },
  });

  // Define the email options
  const mailOptions = {
    from: "contact.leetnode@gmail.com",
    //need to change this to the prof email, currently is to user's email
    to: `${req.body.email}`,
    subject: `Your student, ${req.body.name} (ID:${req.body.id}) needs a little bit of help for the topic: ${req.body.topicName}`,
    text: `Help needed for ${req.body.name} (ID:${req.body.id})`,
  };

  // Send the email
  //   if (req.method === "POST") {
  //   transporter.sendMail(
  //     mailOptions,
  //     (error: any, info: { response: string }) => {
  //       if (error) {
  //         res.status(404).json({
  //           error: `Connection refused at ${error.address}`,
  //         });
  //       } else {
  //         res.status(250).json({
  //           success: "Email sent: " + info.response,
  //         });
  //       }
  //     }
  //   );
  //   }
  transporter.sendMail(
    mailOptions,
    (error: any, info: { response: string }) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    }
  );
  res.status(200).json({
    success: "Email sent! ",
  });
}
