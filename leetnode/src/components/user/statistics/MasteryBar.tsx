import { useEffect, useState } from "react";

import {
  Center,
  createStyles,
  Group,
  Progress,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from "@tabler/icons";

interface RowData {
  topicName: string;
  masteryLevel: number;
}

interface TableSortProps {
  data: RowData[];
}

interface ThProps {
  className: string;
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort, className }: ThProps) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <th className={className}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={14} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key: string) =>
      item[key as keyof RowData].toString().toLowerCase().includes(query)
    )
  );
}

function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        [a, b] = [b, a];
      }
      // compare the two
      if (a[sortBy] < b[sortBy]) {
        return -1;
      } else if (a[sortBy] > b[sortBy]) {
        return 1;
      }
      return 0;
    }),
    payload.search
  );
}

export default function MasteryBar({ data }: TableSortProps) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  useEffect(() => {
    setSortedData(data); // Update the sortedData state when the props change
  }, [data]);

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  const rows = sortedData?.map((row) => (
    <tr key={row.topicName}>
      <td>{row.topicName}</td>
      <td>
        <Group position="apart">
          <Text size="xs" color="cyan" weight={700}>
            {row.masteryLevel}%
          </Text>
        </Group>
        <Progress
          sections={[
            {
              value: row.masteryLevel,
              color: "cyan",
            },
          ]}
          animate
        />
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <TextInput
        className="mt-4"
        placeholder="Search Topic or Mastery..."
        mb="md"
        icon={<IconSearch size={14} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        sx={{ tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <Th
              className="w-1/2 md:w-1/3"
              sorted={sortBy === "topicName"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("topicName")}
            >
              Topic
            </Th>
            <Th
              className="w-1/2 md:w-2/3"
              sorted={sortBy === "masteryLevel"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("masteryLevel")}
            >
              Mastery
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows?.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={Object.keys(data[0] ?? {}).length}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );
}

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));
