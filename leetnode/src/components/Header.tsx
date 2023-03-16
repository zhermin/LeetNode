import axios from "axios";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Header = ({ title = "Personalized Path Mastery" }) => {
  const fullTitle = `LeetNode — ${title}`;
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
      points: number;
    }) => {
      return await axios.post("/api/user/updatePoints", {
        id: session?.data?.user?.id,
        lastActive: variables.currentDatetime,
        loginStreak: variables.loginStreak,
        points: variables.points,
      });
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
              points: userInfo.points + 1,
            });
          }
        } else {
          // Same day
          // Calculate number of seconds till midnight
          const midnight = new Date(); // get midnight
          midnight.setDate(midnight.getDate() + 1);
          midnight.setHours(0, 0, 0, 0);
          const msTillMidnight = midnight.getTime() - currentDatetime.getTime(); // ms to next midnight

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
          return () => clearTimeout(countdown); // Clear timeout when unmount
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
        }
      }
    };

    // Schedules update every 5 minutes
    intervalRef.current = setInterval(updateLastActive, 1 * 60 * 1000);

    // Clean up interval when component unmounts
    return () => {
      console.log("Component unmounted");
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    };
  }, [session?.data?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
