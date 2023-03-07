import axios from "axios";

import {
  Avatar,
  Center,
  Group,
  Loader,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { User } from "@prisma/client";
import { IconCrown } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";

export default function Challenge() {
  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery<User[]>(
    ["challenge"],
    async () => {
      const res = await axios.get("/api/user/getPoints");
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

  allUsers.sort((user1: User, user2: User) => {
    return user2.points - user1.points;
  });

  const rows = allUsers.map((user: User, index: number) => {
    return (
      <tr
        key={user.id}
        className={
          index === 0
            ? "bg-amber-400"
            : index === 1
            ? "bg-slate-400"
            : index === 2
            ? "bg-yellow-600"
            : ""
        }
      >
        <td className="w-1/12 text-center">
          {index === 0 ? (
            <Center>
              <Avatar color="blue" radius="xl">
                <IconCrown size="1.5rem" color="black" />
              </Avatar>
            </Center>
          ) : (
            <Text
              size="sm"
              weight={500}
              c={index === 0 || index === 1 || index === 2 ? "black" : ""}
            >
              # {index + 1}
            </Text>
          )}
        </td>
        <td className="w-10/12">
          <Group spacing="sm">
            <Avatar size={26} src={user.image} radius={26} />
            <Text
              size="sm"
              weight={500}
              c={index === 0 || index === 1 || index === 2 ? "black" : ""}
            >
              {user.name}
            </Text>
          </Group>
        </td>
        <td className="w-1/12 text-center">
          <Text
            size="sm"
            weight={500}
            c={index === 0 || index === 1 || index === 2 ? "black" : ""}
          >
            {user.points}
          </Text>
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <h1 className="text-center">Challenge</h1>
      <hr className="h-px my-4 bg-gray-200 border-0" />
      <Table miw={800} verticalSpacing="sm">
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
