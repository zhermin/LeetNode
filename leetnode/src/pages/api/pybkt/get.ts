import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const displayData = async (req: { id: string; topicSlug: string }) => {

  //   return response.data;
  //   //   //update mastery of student
  //   //   const res = await axios.get(
  //   //     `https://api-deployment.onrender.com//get-mastery/${req.id}/${req.topicSlug}`
  //   //   ); //use data destructuring to get data from the promise object
  //   //   return res.data;
  //   // } catch (error) {
  //   //   console.log(error);
  // };
  // displayData(req.body)
  //   .then(data => {
  //       response.json({ message: 'Request received!', data })
  //   })
  //   .catch(err => console.log(err))
  // const display = await displayData(req.body);
  // console.log(display);

  const response = await axios.get(
    `https://api-deployment.onrender.com/get-mastery/${req.body.id}/${req.body.topicSlug}`
  );
  console.log(response.data);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.status(200).json(response.data);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
