import axios from "axios";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";

import {
  Avatar,
  Box,
  Center,
  Group,
  Loader,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { User } from "@prisma/client";
import { IconCrown, IconSearch } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

export default function Overall() {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<User[]>();

  const PAGE_SIZE = 15;

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);

  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery<User[]>(["challenge"], async () => {
    const res = await axios.get("/api/user/getAllUsersPoints");
    return res.data;
  });

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    if (!!allUsers && debouncedQuery !== "") {
      // Filtering
      setRecords(
        allUsers.filter(({ name, points }) => {
          if (
            !`${name} ${points}`
              .toLowerCase()
              .includes(debouncedQuery.trim().toLowerCase())
          ) {
            return false;
          }
          return true;
        })
      );
    } else if (!!allUsers) {
      setRecords(allUsers.slice(from, to)); // Set record once data is retrieved
    }
  }, [page, debouncedQuery, allUsers]);

  if (!allUsers || isLoading || isError) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <ScrollArea>
      <TextInput
        sx={{ flexBasis: "60%" }}
        placeholder="Search by user"
        icon={<IconSearch size={16} />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        className="m-3"
      />
      <Box sx={{ height: 330 }} className="m-3">
        <DataTable
          withBorder
          records={records}
          columns={[
            {
              accessor: "Rank",
              width: "5%",
              textAlignment: "center",
              render: (record) => {
                return allUsers?.indexOf(record) === 0 ? (
                  <Center>
                    <IconCrown color="black" className="fill-amber-500" />
                  </Center>
                ) : (
                  <Text size="md" weight={500}>
                    {(allUsers?.indexOf(record) ?? 0) + 1}
                  </Text>
                );
              },
            },
            {
              accessor: "nickname",
              width: "80%",
              render: (record) => {
                return (
                  <Group spacing="sm">
                    <Avatar
                      size={26}
                      src={record.image}
                      radius={26}
                      imageProps={{ referrerPolicy: "no-referrer" }} // Avoid 403 forbidden error when loading google profile pics
                    />
                    <Text size="md" weight={500}>
                      {record.nickname ?? record.name}
                    </Text>
                  </Group>
                );
              },
            },
            {
              accessor: "points",
              width: "15%",
              textAlignment: "right",
              render: (record) => (
                <Text size="md" weight={500}>
                  {record.points} ⚡
                </Text>
              ),
            },
          ]}
          totalRecords={allUsers.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => setPage(p)}
          rowStyle={(user: User) =>
            allUsers.indexOf(user) === 0
              ? { backgroundColor: "gold", color: "black" }
              : allUsers.indexOf(user) === 1
              ? { backgroundColor: "silver", color: "black" }
              : allUsers.indexOf(user) === 2
              ? { backgroundColor: "#E67700", color: "black" }
              : undefined
          }
        />
      </Box>
    </ScrollArea>
  );
}
