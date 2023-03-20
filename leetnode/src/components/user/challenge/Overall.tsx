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

export default function Overall() {
  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery<User[]>(["challenge"], async () => {
    const res = await axios.get("/api/user/getAllUsersPoints");
    return res.data;
  });

  if (!allUsers || isLoading || isError) {
    return (
      <Center style={{ height: 500 }}>
        <Loader />
      </Center>
    );
  }

  const rows = allUsers?.map((user: User, index: number) => {
    return (
      <tr
        key={user.id}
        className={
          index === 0
            ? "bg-amber-400" // first
            : index === 1
            ? "bg-slate-400" // second
            : index === 2
            ? "bg-yellow-600" // third
            : "" // remaining
        }
      >
        <td className="w-1/12 text-center">
          {index === 0 ? (
            <Center>
              <IconCrown size="2rem" color="black" className="fill-amber-500" />
            </Center>
          ) : (
            <Text
              size="md"
              weight={500}
              c={index === 0 || index === 1 || index === 2 ? "black" : ""} // visibility
            >
              # {index + 1}
            </Text>
          )}
        </td>
        <td className="w-10/12">
          <Group spacing="sm">
            <Avatar
              size={26}
              src={user.image}
              radius={26}
              imageProps={{ referrerPolicy: "no-referrer" }} // Avoid 403 forbidden error when loading google profile pics
            />
            <Text
              size="md"
              weight={500}
              c={index === 0 || index === 1 || index === 2 ? "black" : ""} // visibility
            >
              {user.nickname ?? user.name}
            </Text>
          </Group>
        </td>
        <td className="w-1/12 text-center">
          <Text
            size="md"
            weight={500}
            c={index === 0 || index === 1 || index === 2 ? "black" : ""} // visibility
          >
            {user.points} ⚡
          </Text>
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <Table miw={800} verticalSpacing="sm" className="mt-1">
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
