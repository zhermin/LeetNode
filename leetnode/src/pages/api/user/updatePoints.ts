import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/db/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    } else {
        try {
            const info = await prisma.user.update({
                where: {
                    id: req.body.id,
                },
                data: {
                    lastActive: req.body.lastActive,
                    loginStreak: req.body.loginStreak,
                    firstQuestion: req.body.firstQuestion,
                    points: req.body.points
                },
            });
            res.status(200).json(info);
        } catch (error) {
            res.status(400).json({ message: "Something went wrong" });
        }
    }
}
