import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

import { sendRecruitmentEmail } from "./sendRecruitmentEmails";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let emails: string[] = req.body.emails;
  const toSendRecruitmentEmails: boolean = req.body.toSendRecruitmentEmails;

  try {
    const allUsers = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
      },
    });

    // Filter out emails that already exist in the database
    emails = emails.filter(
      (email) => !allUsers.some((user) => user.email === email)
    );

    // Create new users with the filtered emails
    await prisma.user.createMany({
      data: emails.map((email) => {
        let username = email.split("@")[0] ?? email;
        if (allUsers.some((user) => user.username === username)) {
          username = email;
        }
        return {
          email,
          username,
          image: `https://api.dicebear.com/6.x/fun-emoji/png?seed=${username}`,
        };
      }),
      skipDuplicates: true,
    });

    // Remove users from waitlist if they were on it
    await prisma.waitlist.deleteMany({
      where: {
        email: {
          in: emails,
        },
      },
    });

    // Send recruiment emails
    if (toSendRecruitmentEmails) {
      await sendRecruitmentEmail(emails);
    }

    res.status(200).json({
      message:
        "New users added and recruitment emails sent successfully (duplicates ignored)",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error creating users or sending recruitment emails" });
  }
}
