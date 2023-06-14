import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export const sendConsentEmail = async (emails: string[]) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await Promise.all(
    emails.map(async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject:
          "Invitation to Use an Adaptive Learning Software to Bridge Electrical Circuit Knowledge Gaps",
        text: `
          Dear Student,
      
          Each year, a significant number of students perform poorly in EE2027 as a result of knowledge gaps in electrical circuit principles covered in EE1111A and EE2111A.  We believe that many of these students would benefit from early detection and intervention to bridge their knowledge gaps.
      
          We have developed an adaptive learning software to help bridge any potential knowledge gaps.  You are encouraged to use the software to test and improve your knowledge in relevant electrical circuit principles until you have attained a "mastery score" of at least 80% for every topic.
      
          The software can be accessed via https://leetnode.vercel.app
          
          Your login email is as follows: ${email}
      
          Upon entering your email address, you will be sent a magic link, likely in your junk folder. Click on the email's magic link to sign in, no passwords required. However, please feel free to change your username after logging in.
      
          Upon logging in, we will request for your consent to allow your software's usage log data to be available for research purposes, and also to link these log data to your performance in EE1111A, EE2111A, and EE2027. To protect your privacy, your lecturers for the above modules will not know whether you have agreed to participate in this research study; only the Principal Investigator (i.e., me), who does not teach the above three modules, will have this information.
      
          While you will be able to use the software without providing the above consent, the insights gained from our research study could potentially benefit future students taking similar modules in NUS, and beyond.  
          Thank you very much for your help and support.
      
          Thanks and regards,
          Assoc. Prof. Soh Wee Seng
        `,
        html: `
          <p>Dear Student,</p>
      
          <p>Each year, a significant number of students perform poorly in EE2027 as a result of knowledge gaps in electrical circuit principles covered in EE1111A and EE2111A.  We believe that many of these students would benefit from early detection and intervention to bridge their knowledge gaps.</p>
      
          <p>We have developed an adaptive learning software to help bridge any potential knowledge gaps.  You are encouraged to use the software to test and improve your knowledge in relevant electrical circuit principles until you have attained a "mastery score" of at least 80% for every topic.</p>
      
          <p>The software can be accessed via <a href="https://leetnode.vercel.app" target="_blank">https://leetnode.vercel.app</a></p>
          
          <p>Your login email is as follows: <u>${email}</u></p>
      
          <p>Upon entering your email address, you will be sent a magic link, likely in your junk folder. Click on the email's magic link to sign in, no passwords required. However, please feel free to change your username after logging in.</p>
      
          <p>Upon logging in, we will request for your consent to allow your software's usage log data to be available for research purposes, and also to link these log data to your performance in EE1111A, EE2111A, and EE2027. To protect your privacy, your lecturers for the above modules will not know whether you have agreed to participate in this research study; only the Principal Investigator (i.e., me), who does not teach the above three modules, will have this information.</p>
      
          <p>While you will be able to use the software without providing the above consent, the insights gained from our research study could potentially benefit future students taking similar modules in NUS, and beyond. Thank you very much for your help and support.</p>
      
          <p>Thanks and regards,</p>
          <p>Assoc. Prof. Soh Wee Seng</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    })
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const emails: string[] = req.body.emails;

  try {
    await sendConsentEmail(emails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending consent emails" });
  }

  res.status(200).json({ message: "Consent emails sent successfully" });
}
