import axios from "axios";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useRef } from "react";

import { User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserData extends User {
  attempts: { [timestamp: string]: number };
}

const Header = ({ title = "Personalized Path Mastery" }) => {
  const fullTitle = `LeetNode — ${title}`;
  const session = useSession();
  const queryClient = useQueryClient();

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery<UserData>(
    ["userInfo", session?.data?.user?.id],
    async () => {
      const res = await axios.post("/api/user", {
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
      points: number;
    }) => {
      const res = await axios.post("/api/user/updatePoints", {
        id: session?.data?.user?.id,
        lastActive: variables.currentDatetime,
        loginStreak: variables.loginStreak,
        points: variables.points,
      });
      return {
        ...res,
        data: {
          ...res.data,
          customIcon: "📅",
          message: (
            <>
              Login Streak: {res?.data?.loginStreak} ⚡
              <span className="text-yellow-600">
                +{res?.data?.loginStreak < 5 ? res?.data?.loginStreak : 5}
              </span>
            </>
          ),
        },
      };
    },
    {
      onSuccess: (res) => {
        queryClient.setQueryData(["userInfo", session?.data?.user?.id], {
          ...userInfo,
          lastActive: res.data.lastActive,
          loginStreak: res.data.loginStreak,
          points: res.data.points,
        });
        queryClient.invalidateQueries(["challenge"]); // Sync the points in both tabs of the challenge page
      },
    }
  );

  useEffect(() => {
    const checkActive = () => {
      // Run only if user is logged in
      if (!(isLoading || isError || !userInfo)) {
        const lastActive = new Date(userInfo.lastActive); // get last active
        const currentDatetime = new Date(); // get current datetime

        const points =
          currentDatetime.getMonth() === lastActive.getMonth()
            ? userInfo.points
            : 0; // Reset points if different month

        // If not same day
        if (currentDatetime.toDateString() !== lastActive.toDateString()) {
          lastActive.setDate(lastActive.getDate() + 1); // Get next day from lastActive
          if (currentDatetime.toDateString() === lastActive.toDateString()) {
            // Consecutive days
            updateActive({
              currentDatetime: currentDatetime,
              loginStreak: userInfo.loginStreak + 1,
              points:
                userInfo.loginStreak + 1 < 5
                  ? points + userInfo.loginStreak + 1
                  : points + 5, // Cumulative addition of points based on streak (caps at 5)
            });
          } else {
            // Not consecutive days
            updateActive({
              currentDatetime: currentDatetime,
              loginStreak: 1,
              points: points + 1,
            });
          }
        } else {
          // Same day
          // Calculate number of seconds till midnight
          const midnight = new Date(); // get midnight
          midnight.setDate(midnight.getDate() + 1);
          midnight.setHours(0, 0, 0, 0);
          const msTillMidnight = midnight.getTime() - currentDatetime.getTime(); // ms to next midnight

          // Prevent re-rendering
          if (msTillMidnight > 0) {
            // Trigger at midnight
            const countdown = setTimeout(() => {
              updateActive({
                currentDatetime: currentDatetime,
                loginStreak: userInfo.loginStreak + 1,
                points:
                  userInfo.loginStreak + 1 < 5
                    ? userInfo.points + userInfo.loginStreak + 1
                    : userInfo.points + 5, // Cumulative addition of points based on streak (caps at 5)
              }); // Mutation will trigger the useEffect loop to automatically calculate the no. of seconds for the following midnight and so forth
            }, msTillMidnight);
            return () => {
              clearTimeout(countdown);
            }; // Clear timeout when unmount
          }
        }
      }
    };

    checkActive(); // Run immediately once user logs in
  }, [userInfo, isLoading, isError, updateActive]);

  // Periodically updates last active datetime if user is logged in
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateLastActive = async () => {
      if (!!session?.data?.user?.id) {
        try {
          const { data } = await axios.post("/api/prof/updateLastActive", {
            id: session?.data?.user?.id as string,
          });
          console.log("Last Active Updated @", new Date(data.lastActive));
        } catch (error) {
          console.error(error);
          clearInterval(intervalRef.current);
        }
      }
    };

    // Schedules update every few minutes
    intervalRef.current = setInterval(updateLastActive, 1 * 60 * 1000);

    // Clean up interval when component unmounts
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    };
  }, [session?.data?.user?.id]);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta
        name="description"
        content="Achieve mastery in concepts by doing questions tailored to your skill level. Receive feedback on your progression and challenge yourself as you advance through progressively more advanced questions for each individual topic."
      />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    </Head>
  );
};

export default Header;
