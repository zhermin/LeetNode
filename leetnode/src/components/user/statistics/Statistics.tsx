import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Center, Loader, ScrollArea, SegmentedControl } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import MasteryBar from "./MasteryBar";
import Overview from "./Overview";
import RadarChart from "./RadarChart";

export default function Statistics() {
  const session = useSession();
  const [view, setView] = useState("bar");
  const [period, setPeriod] = useState("current");

  const {
    data: masteryData,
    isLoading,
    isError,
  } = useQuery(
    ["stats", period],
    async () => {
      const res = await axios.post("/api/user/getMastery", {
        id: session?.data?.user?.id,
        period: period,
      });
      return res?.data;
    },
    { keepPreviousData: true }
  );

  if (!masteryData || isLoading || isError) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <ScrollArea>
      <h1 className="text-center">Statistics</h1>
      <hr className="my-4 h-px border-0 bg-gray-200" />
      <SegmentedControl
        color="cyan"
        value={period}
        onChange={setPeriod}
        data={[
          { label: "Current", value: "current" },
          { label: "Previous week", value: "week" },
          { label: "2 Weeks ago", value: "fortnight" },
        ]}
        fullWidth
      />
      <Overview data={masteryData} />
      <SegmentedControl
        color="cyan"
        value={view}
        onChange={setView}
        data={[
          { label: "Bar", value: "bar" },
          { label: "Radar", value: "radar" },
        ]}
        fullWidth
        className="hidden xl:flex" // Disable radar view if sm-lg (due to resizing and overlapping labels)
      />

      {view === "radar" ? (
        <RadarChart data={masteryData} />
      ) : (
        <MasteryBar data={masteryData} />
      )}
    </ScrollArea>
  );
}
