import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";

import {
  Center,
  Group,
  Loader,
  ScrollArea,
  SegmentedControl
} from "@mantine/core";
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
      const res = await axios.post("/api/pybkt/getAll", {
        id: session?.data?.user?.id,
        period: period,
      });
      return res?.data;
    },
    { keepPreviousData: true }
  );

  if (isLoading || isError || masteryData?.length < 1) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <ScrollArea>
      <h1 className="text-center">Statistics</h1>
      <hr className="h-px my-4 bg-gray-200 border-0" />
      <Overview data={masteryData} />
      <Group position="apart">
        <SegmentedControl
          color="cyan"
          value={period}
          onChange={setPeriod}
          data={[
            { label: "Current", value: "current" },
            { label: "Previous week", value: "week" },
            { label: "2 Weeks ago", value: "fortnight" },
          ]}
        />
        <SegmentedControl
          color="cyan"
          value={view}
          onChange={setView}
          data={[
            { label: "Bar", value: "bar" },
            { label: "Radar", value: "radar" },
          ]}
        />
      </Group>

      {view === "bar" ? (
        <MasteryBar data={masteryData} />
      ) : (
        <RadarChart data={masteryData} />
      )}
    </ScrollArea>
  );
}
