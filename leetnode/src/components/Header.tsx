import axios from "axios";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Header = ({ title = "Personalized Path Mastery" }) => {
  const session = useSession();
  const queryClient = useQueryClient();

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery(
    ["userInfo", session?.data?.user?.id],
    async () => {
      const res = await axios.post("/api/user/get", {
        id: session?.data?.user?.id,
      });
      return res?.data;
    },
    { enabled: !!session?.data?.user?.id }
  );

  const { mutate: updateActive } = useMutation(
    async (variables: {
      currentDatetime: Date;
      loginStreak: number;
      firstQuestion: boolean;
      points: number;
    }) => {
      return await axios.post("/api/user/updatePoints", {
        id: session?.data?.user?.id,
        lastActive: variables.currentDatetime,
        loginStreak: variables.loginStreak,
        firstQuestion: variables.firstQuestion,
        points: variables.points,
      });
    },
    {
      onSuccess: (res) => {
        queryClient.setQueryData(["userInfo", session?.data?.user?.id], {
          ...userInfo,
          lastActive: res.data.lastActive,
          loginStreak: res.data.loginStreak,
          firstQuestion: res.data.firstQuestion,
          points: res.data.points,
        });
        toast(
          () => (
            <span>
              Login Streak: {res?.data?.loginStreak} ⚡
              <span className="text-yellow-600">
                +{res?.data?.loginStreak < 5 ? res?.data?.loginStreak : 5}
              </span>
            </span>
          ),
          {
            icon: "📅",
            id: "updateActive",
          }
        ); // Notification for successful update
      },
      onError: () => {
        toast.error("Error updating points system", {
          id: "updateActive",
        }); // Notification for failed update
      },
    }
  );

  useEffect(() => {
    const checkActive = () => {
      // Run only if user is logged in
      if (!(isLoading || isError || !userInfo)) {
        const lastActive = new Date(userInfo.lastActive); // get last active
        const currentDatetime = new Date(); // get current datetime

        // If not same day
        if (currentDatetime.toDateString() !== lastActive.toDateString()) {
          lastActive.setDate(lastActive.getDate() + 1);
          if (currentDatetime.toDateString() === lastActive.toDateString()) {
            // Consecutive days
            updateActive({
              currentDatetime: currentDatetime,
              loginStreak: userInfo.loginStreak + 1,
              firstQuestion: true,
              points:
                userInfo.loginStreak + 1 < 5
                  ? userInfo.points + userInfo.loginStreak + 1
                  : userInfo.points + 5, // Cumulative addition of points based on streak (caps at 5)
            });
          } else {
            // Not consecutive days
            updateActive({
              currentDatetime: currentDatetime,
              loginStreak: 1,
              firstQuestion: true,
              points: userInfo.points + 1,
            });
          }
        }
      }
    };

    checkActive(); // Run immediately once user logs in
    const interval = setInterval(() => {
      checkActive();
    }, 60000); // Run every minute
    return () => clearInterval(interval); // Clear interval when unmount
  }, [userInfo, isLoading, isError, updateActive]);

  const fullTitle = `LeetNode — ${title}`;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta
        name="description"
        content="Achieve mastery in concepts by doing questions tailored to your skill level. Receive feedback on your progression and challenge yourself as you advance through progressively more advanced questions for each individual topic."
      />
      <link rel="icon" href="/logo/leetnode-logo.png" />
    </Head>
  );
};

export default Header;
