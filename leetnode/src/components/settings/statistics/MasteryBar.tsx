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
  UnstyledButton
} from "@mantine/core";
import { keys } from "@mantine/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector
} from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
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

interface RowData {
  topicSlug: string;
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
      item[key].toString().toLowerCase().includes(query)
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
        if (typeof a[sortBy] === "number" || typeof b[sortBy] === "number") {
          return b[sortBy] - a[sortBy];
        }
        return b[sortBy].localeCompare(a[sortBy]);
      }
      if (typeof a[sortBy] === "number" || typeof b[sortBy] === "number") {
        return a[sortBy] - b[sortBy];
      }
      return a[sortBy].localeCompare(b[sortBy]);
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
    <tr key={row.topicSlug}>
      <td className="capitalize">{row.topicSlug.replace(/-/g, " ")}</td>
      <td>
        <Group position="apart">
          <Text size="xs" color="cyan" weight={700}>
            {row.masteryLevel * 100}%
          </Text>
          <Text size="xs" color="red" weight={700}>
            {}%
          </Text>
        </Group>
        <Progress
          sections={[
            {
              value: row.masteryLevel * 100,
              color: "cyan",
            },
            {
              value: 0 * 100,
              color: "red",
            },
          ]}
        />
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <TextInput
        className="mt-4"
        placeholder="Search by any field"
        mb="md"
        icon={<IconSearch size={14} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        sx={{ tableLayout: "fixed", minWidth: 700 }}
      >
        <thead>
          <tr>
            <Th
              className="w-1/3"
              sorted={sortBy === "topicSlug"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("topicSlug")}
            >
              Topic
            </Th>
            <Th
              className="w-2/3"
              sorted={sortBy === "masteryLevel"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("masteryLevel")}
            >
              Mastery Level
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows?.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={Object.keys(data[0]).length}>
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
