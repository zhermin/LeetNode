import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Center, Loader, ScrollArea, SegmentedControl } from "@mantine/core";
import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import Overall from "./Overall";
import Personal from "./Personal";

export default function Challenge() {
  const session = useSession();
  const [view, setView] = useState("personal");

  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery(
    ["challenge"],
    async () => {
      const res = await axios.get("/api/user/getAllUsersPoints");
      return res.data;
    },
    { keepPreviousData: true }
  );

  if (!allUsers || isLoading || isError) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  // sort by descending order
  allUsers?.sort((user1: User, user2: User) => {
    return user2.points - user1.points;
  });

  const index = allUsers
    ?.map((user: User) => {
      return user?.id;
    })
    .indexOf(session?.data?.user?.id);

  return (
    <ScrollArea>
      <h1 className="text-center">Challenge</h1>
      <hr className="h-px my-4 bg-gray-200 border-0" />
      <SegmentedControl
        color="cyan"
        value={view}
        onChange={setView}
        data={[
          { label: "Personal", value: "personal" },
          { label: "Overall", value: "overall" },
        ]}
        fullWidth
      />
      {view === "personal" ? (
        <Personal index={index} />
      ) : (
        <Overall allUsers={allUsers} />
      )}
    </ScrollArea>
  );
}
