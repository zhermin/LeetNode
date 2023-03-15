import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

import { prisma } from "@/server/db/client";
import { Frequency, Mastery } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.ACTION_KEY === req.headers.authorization?.split(" ")[1]) {
    // If authorised
    try {
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const now = new Date().getTime();

      //checks all mastery for ppl with errorMeter value
      const checkError = await prisma.mastery.findMany({
        where: {
          errorMeter: {
            gt: 4, //errorMeter > 4
          },
          topicPing: true
        },
        orderBy: {
          topicSlug: 'asc' // Sort by topic
        },
        include: {
          user: {
            select: {
              nusnetId: true,
              name: true,
              email: true
            },
          },
          topic: {
            select: {
              topicName: true,
            },
          },
        },
      });

      // Filter the records to find those who haven't been pinged before
      // and those who haven't been pinged in a week
      const usersPing = checkError.filter(
        (record) =>
        (record.lastFlagged === null ||
          now - new Date(record.lastFlagged as Date).getTime() >= oneWeek)
      );

      // get all emails with ADMIN role
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN" || "SUPERUSER",
          emailFrequency: Frequency.Daily // will add filter in the future
        },
        select: {
          email: true,
        },
      });

      if (admins.length === 0) {
        res.status(404).json({ error: "Mailist empty" });
      }

      // Convert to array of emails
      const maillist = admins.map((admin) => {
        return admin.email;
      });

      // For clients with plaintext support only
      const templateString = usersPing.map(
        (student) => `
          Topic name: ${student.topic.topicName}\n
          Name: ${student.user.name} 
          Matric No.: ${student.user.nusnetId}
          Email: ${student.user.email}\n
          `
      );

      // HTML table rows
      const rows = usersPing.map((student) => {
        return `
        <tr>
          <td style="border: 1px solid; width: 50%">${student.topic.topicName}</td>
          <td style="border: 1px solid; text-align: center">${student.user.name}</td>
          <td style="border: 1px solid; text-align: center">${student.user.nusnetId}</td>
          <td style="border: 1px solid; text-align: center">${student.user.email}</td>
        </tr>
        `;
      }).join('');

      // Create a transporter for sending the email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL,
          pass: process.env.GMAIL_PASS,
        },
      });

      // Define the email options
      const mailOptions = {
        from: process.env.GMAIL,
        //need to change this to the prof email, currently is to admins' email
        to: `${maillist}`,
        subject: "LeetNode students' summary",
        text: `
        Here are the list of students that require help:\n\n${templateString}\n
        Click here to view more: https://leetnode.vercel.app/dashboard
        `,
        html: `
        <p>Here are the list of students that require help:</p>
        <table style="width:100%; border:1px solid; border-collapse: collapse">
          <thead>
            <th style="border: 1px solid; text-align: center">Topic</th>
            <th style="border: 1px solid; text-align: center">Name</th>
            <th style="border: 1px solid; text-align: center">Student ID</th>
            <th style="border: 1px solid; text-align: center">Email</th>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p>
          Click here to view more: <a href="https://leetnode.vercel.app/dashboard">Prof's dashboard</a>
        </p>
        `,
      };

      await transporter.sendMail(mailOptions)

      // update lastFlagged when this is called
      usersPing.map(async (record) => {
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

      res.status(200).json("success");
    } catch (err) {
      res.status(500).json({ error: err });
    }
  } else {
    res.status(401).json({ error: "Unauthorised" });
  }
}
