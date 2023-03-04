import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dummyStudent = await axios.post(
    `https://pybkt-api-deployment.herokuapp.com/add-student/test/${req.body.topicSlug}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
      },
    }
  );

  const dummyData = dummyStudent.data;
  console.log(dummyData);

  const getMastery = await axios.get(
    `https://pybkt-api-deployment.herokuapp.com/get-mastery/test/${req.body.topicSlug}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
      },
    }
  );

  const mastery = getMastery.data;
  console.log(mastery);

  const deleteStudent = await axios.delete(
    `https://pybkt-api-deployment.herokuapp.com/remove-student/test/${req.body.topicSlug}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
      },
    }
  );

  const delStudent = deleteStudent.data;
  console.log(delStudent);

  try {
    res.status(200).json(mastery); // should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
