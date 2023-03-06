import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    } else {
        try {
            const info = await prisma.user.findMany({
                where: {
                    role: {
                        equals: "USER"
                    }
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    // loginStreak: true,
                    // firstQuestion: true,
                    points: true
                },
            });
            res.status(200).json(info);
        } catch (error) {
            res.status(400).json({ message: "Something went wrong" });
        }
    }
}
