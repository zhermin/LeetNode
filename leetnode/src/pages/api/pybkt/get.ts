import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const displayData = async (req: {
  //   id: string;
  //   skill: string;
  // }) => {
  //   try {
  //     //update mastery of student
  //     const res = await axios.post(
  //       `http://127.0.0.1:8000/get-mastery/${req.id}/${req.skill}`
  //     ); //use data destructuring to get data from the promise object
  //     return res.data;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // const display = await displayData(req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json(req.body);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
