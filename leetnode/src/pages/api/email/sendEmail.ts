import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

import { prisma } from "@/server/db/client";
import { Mastery } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const now = new Date().getTime();

  //checks all mastery for ppl with errorMeter value
  const checkError = await prisma.mastery.findMany({
    where: {
      errorMeter: {
        gt: 0,
      },
    },
    include: {
      topic: {
        select: {
          topicName: true,
        },
      },
    },
  });

  // Filter the records to find those with errorMeter % 5,
  // and 5 in a row wrong and haven't been pinged in a week
  const usersPing = checkError.filter(
    (record) =>
      record.topicPing === true &&
      record.errorMeter % 5 === 0 &&
      (now - new Date(record.lastFlagged as Date).getTime() >= oneWeek ||
        record.lastFlagged === null)
  );

  console.log(usersPing);

  // get all users in prisma
  const allUsers = await prisma.user.findMany();

  // get all emails with ADMIN role
  const maillist = allUsers
    .filter((attribute: { role: string }) => {
      return attribute.role == "ADMIN";
    })
    .map((admins: { email: string }) => admins.email);

  // append allUsers' names to usersPing (those ppl who will be flagged)
  const result: {
    userId: string;
    topicSlug: string;
    masteryLevel: number;
    topicPing: boolean;
    lastFlagged: Date | null;
    errorMeter: number;
    topic: { topicName: string };
    name: string | undefined;
  }[] = usersPing.map(
    (ping: {
      userId: string;
      topicSlug: string;
      masteryLevel: number;
      topicPing: boolean;
      lastFlagged: Date | null;
      errorMeter: number;
      topic: { topicName: string };
    }) => {
      const user = allUsers.find((u: { id: string }) => u.id === ping.userId);
      return { ...ping, name: user?.name };
    }
  );

  console.log(result);

  // update lastFlagged when this is called
  result.map(async (record) => {
    const flagUpdate: Mastery = await prisma.mastery.update({
      where: {
        userId_topicSlug: {
          userId: record.userId as string,
          topicSlug: record.topicSlug as string,
        },
      },
      data: {
        lastFlagged: new Date(),
      },
    });
    console.log(flagUpdate);
  });

  // // const usersFlagged = usersPing.map(ids => {allUsers.filter((attribute: { name: string }) => {
  // //   attribute.name === "ADMIN";
  // // })})

  const templateString = result.reduce(
    (
      acc: string,
      rec: {
        topic: { topicName: string };
        name: string | undefined;
        userId: string;
      }
    ) => {
      const topicName = rec.topic.topicName;

      return (
        acc + `\n${topicName}:\n  Name: ${rec.name}, userId: ${rec.userId}\n`
      );
    },
    ""
  );

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
    to: `${maillist}`,
    subject: "Here are the list of students that require help",
    text: `Here are the list of students that require help:\n${templateString}`,
  };
  new Promise((resolve, reject) => {
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: { response: string }) => {
        if (error) {
          reject(error);
        } else {
          resolve("Email sent: " + info.response);
        }
      }
    );
  });

  // // res.status(200).json(templateString);
  try {
    res.status(200).json(templateString);
  } catch (err) {
    res.status(500).json({ error: err });
  }
  // try {
  //   res.status(200).json({ success: "Email sent!" });
  // } catch (err) {
  //   res.status(500).json({ error: err });
  // }
}
