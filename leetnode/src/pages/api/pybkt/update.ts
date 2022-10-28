import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { prisma } from "@/server/db/client";
import { Mastery } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const displayData = async (req: {
    id: string;
    topicSlug: string;
    correct: number;
  }) => {
    //patch then get data then update mastery
    const res = await axios.patch(
      `https://pybkt-api-deployment.herokuapp.com/update-state/${req.id}/${
        req.topicSlug
      }/${String(req.correct)}`,
      req
    );

    const info = res.data.Updated;

    if (info === true) {
      const res2 = await axios.get(
        `https://pybkt-api-deployment.herokuapp.com/get-mastery/${req.id}/${req.topicSlug}`
      );
      console.log("reached res2");
      console.log(res2.data);
      const output = res2.data;

      return output;
    } else {
      console.log("something went wrong");
    }
  };

  //   try {
  //     //update mastery of student
  //     //prettier-ignore
  //     const res = await axios.patch(
  //       `https://pybkt-api-deployment.herokuapp.com/update-state/${req.id}/${req.topicSlug}/${String(req.correct)}`,
  //       req
  //     )
  //     .then( response=>{
  //       console.log("test response")
  //       console.log(response.data.Updated)
  //       if (response.data.Updated === true){
  //         console.log("response tested true")
  //         axios.get(
  //           `https://pybkt-api-deployment.herokuapp.com/get-mastery/${req.id}/${req.topicSlug}`
  //         )
  //         .then(function (response){
  //           console.log(response.data);
  //           return response.data
  //         })
  //       }
  //       else {
  //         console.log("smth went wrong")
  //       }
  //     }) //use data destructuring to get data from the promise object
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   const output = await res;
  //   console.log("output");
  //   console.log(output);
  //   return output;
  // };

  const display = await displayData(req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // update instead of create (in Mastery table) if exist
  const mastery: Mastery = await prisma.mastery.upsert({
    where: {
      userId_topicSlug: {
        userId: req.body.id as string,
        topicSlug: req.body.topicSlug as string,
      },
    },
    update: {
      masteryLevel: display.Mastery,
    },
    create: {
      userId: req.body.id as string,
      topicSlug: req.body.topicSlug as string,
      masteryLevel: display.Mastery,
    },
  });
  // console.log("test");
  console.log(mastery);

  try {
    res.status(200).json(display); // should be displaying mastery table
  } catch (err) {
    res.status(400).json({ message: "Something went wrong" });
  }
}
