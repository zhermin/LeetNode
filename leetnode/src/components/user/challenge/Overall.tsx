import axios from "axios";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";

import {
  Avatar,
  Center,
  Flex,
  Loader,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconCrown, IconSearch } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

type UserWithPoints = {
  id: string;
  username: string;
  points: number;
  image: string | null;
};

export default function Overall() {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<UserWithPoints[]>();

  const PAGE_SIZE = 15;

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);

  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["challenge"],
    queryFn: async () => {
      const res = await axios.get<UserWithPoints[]>(
        "/api/user/getAllUsersPoints"
      );
      return res.data;
    },
  });

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    if (!!allUsers && debouncedQuery.trim() !== "") {
      setRecords(
        allUsers.filter(({ username }) => {
          if (
            !username
              .toLowerCase()
              .includes(debouncedQuery.trim().toLowerCase())
          ) {
            return false;
          }
          return true;
        })
      );
    } else if (!!allUsers) {
      setRecords(allUsers.slice(from, to));
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
        placeholder="Search User..."
        icon={<IconSearch size={16} />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        m="sm"
      />
      <DataTable
        withBorder
        minHeight={320}
        mx="sm"
        highlightOnHover
        borderRadius="sm"
        records={records}
        columns={[
          {
            accessor: "rank",
            width: "10%",
            textAlignment: "center",
            render: (record) =>
              allUsers?.indexOf(record) === 0 ? (
                <Center>
                  <IconCrown color="black" stroke={1.5} className="fill-amber-500" />
                </Center>
              ) : (
                <Text size="sm" weight={500}>
                  {(allUsers?.indexOf(record) ?? 0) + 1}
                </Text>
              ),
          },
          {
            accessor: "username",
            width: "65%",
            render: (record) => (
              <Flex gap="xs" align="center">
                <Avatar size={18} src={record.image} radius={18} />
                <Text size="sm" weight={500} className="whitespace-pre-wrap">
                  {record.username}
                </Text>
              </Flex>
            ),
          },
          {
            accessor: "points",
            width: "25%",
            textAlignment: "right",
            render: (record) => (
              <Text size="sm" weight={500}>
                {record.points} 🔋
              </Text>
            ),
          },
        ]}
        totalRecords={allUsers.length}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        rowStyle={(user) =>
          allUsers.indexOf(user) === 0
            ? { backgroundColor: "gold", color: "black" }
            : allUsers.indexOf(user) === 1
            ? { backgroundColor: "silver", color: "black" }
            : allUsers.indexOf(user) === 2
            ? { backgroundColor: "#E67700", color: "black" }
            : undefined
        }
      />
    </ScrollArea>
  );
}
