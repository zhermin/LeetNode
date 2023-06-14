import axios from "axios";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { UsersWithMasteriesAndAttemptsType } from "@/pages/admin";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Accordion,
  ActionIcon,
  Button,
  Center,
  Code,
  Container,
  createStyles,
  Flex,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { randomId, useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { Role } from "@prisma/client";
import {
  IconCheck,
  IconMail,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RoleBadge } from "../misc/Badges";

export default function Accounts() {
  const { theme, classes } = useStyles();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const queryClient = useQueryClient();

  const currentUser = useRef<UsersWithMasteriesAndAttemptsType[number]>();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

  const { data: users, isFetching } = useQuery({
    queryKey: ["all-users"],
    queryFn: () =>
      axios.get<UsersWithMasteriesAndAttemptsType>("/api/user/admin"),
  });

  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>();
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(users?.data.slice(0, PAGE_SIZE));
  const [totalRecords, setTotalRecords] = useState(users?.data.length);
  const [selectedRecords, setSelectedRecords] =
    useState<UsersWithMasteriesAndAttemptsType>([]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "role",
    direction: "asc",
  });
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);

  useEffect(() => {
    if (!users) return;

    const filteredRecords = users.data.filter((record) => {
      if (
        debouncedQuery !== "" &&
        !`${record.username} ${record.email} ${record.role}`
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    const sortedRecords = filteredRecords.sort((a, b) => {
      if (sortStatus.columnAccessor === "role") {
        if (sortStatus.direction === "asc") {
          return b.role.length - a.role.length;
        } else {
          return a.role.length - b.role.length;
        }
      } else if (sortStatus.columnAccessor === "username") {
        if (sortStatus.direction === "asc") {
          return a.username.localeCompare(b.username);
        } else {
          return b.username.localeCompare(a.username);
        }
      } else if (sortStatus.columnAccessor === "email") {
        if (sortStatus.direction === "asc") {
          return a.email.localeCompare(b.email);
        } else {
          return b.email.localeCompare(a.email);
        }
      } else if (sortStatus.columnAccessor === "emailVerified") {
        if (sortStatus.direction === "asc") {
          return a.emailVerified ? -1 : 1;
        } else {
          return b.emailVerified ? -1 : 1;
        }
      }
      return 0;
    });

    setTotalRecords(sortedRecords.length);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(sortedRecords.slice(from, to));
  }, [page, users, sortStatus, debouncedQuery]);

  const addUsersForm = useForm({
    initialValues: {
      emails: [
        {
          id: randomId(),
          value: "",
        },
      ],
    },
    validateInputOnBlur: true,
    validate: zodResolver(
      z.object({
        emails: z
          .array(
            z.object({
              id: z.string(),
              value: z.string().trim().email("Invalid email"),
            })
          )
          .nonempty(),
      })
    ),
  });

  const { mutate: addUsers, status: addUsersStatus } = useMutation({
    mutationFn: (emails: string[]) =>
      axios.post("/api/user/admin/add", { emails }),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
  });

  const { mutate: sendConsentEmails } = useMutation({
    mutationFn: (users: UsersWithMasteriesAndAttemptsType) =>
      axios.post("/api/user/sendConsentEmails", {
        emails: users.map((user) => user.email),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
  });

  const { mutate: deleteUser, status: deleteUserStatus } = useMutation({
    mutationFn: (email: string) =>
      axios.delete(`/api/user/admin/delete?email=${email}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
  });

  return (
    <>
      <Container size="lg" py={!mobile ? "xl" : undefined}>
        <Center>
          <Stack align="center" mb="md">
            <Title order={2} className={classes.title} align="center">
              All Accounts
            </Title>
          </Stack>
        </Center>

        <Accordion
          variant="contained"
          mb="xl"
          chevron={<IconPlus size="1rem" />}
          styles={{
            control: {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.white,
              borderBottom: `1px solid ${
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[3]
              }`,
              "&:hover": {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[5]
                    : theme.colors.gray[1],
              },
            },

            chevron: {
              "&[data-rotate]": {
                transform: "rotate(45deg)",
              },
            },
          }}
        >
          <Accordion.Item value="add-new-users">
            <Accordion.Control fz="sm">Add New Users</Accordion.Control>
            <Accordion.Panel
              bg={
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.colors.gray[1]
              }
            >
              <form
                onSubmit={addUsersForm.onSubmit(
                  (values) => {
                    addUsers(values.emails.map((email) => email.value));
                  },
                  (errors) => {
                    Object.keys(errors).forEach((key) => {
                      toast.error(errors[key] as string);
                    });
                  }
                )}
              >
                <Stack spacing="md" pt="xs" align="stretch">
                  {addUsersForm.values.emails.map((email, index) => (
                    <Flex gap="md" align="center" key={email.id}>
                      <TextInput
                        placeholder="eXXXXXXX@u.nus.edu"
                        type="email"
                        sx={{ flex: 1 }}
                        {...addUsersForm.getInputProps(`emails.${index}.value`)}
                      />
                      <ActionIcon
                        className="rounded-full"
                        onClick={() => {
                          addUsersForm.removeListItem("emails", index);
                        }}
                      >
                        <IconMinus size={16} />
                      </ActionIcon>
                    </Flex>
                  ))}
                  <Button
                    variant="light"
                    color="gray"
                    className={
                      theme.colorScheme === "dark"
                        ? "bg-zinc-800 hover:bg-zinc-700"
                        : "bg-gray-200 hover:bg-gray-300"
                    }
                    onClick={() => {
                      addUsersForm.insertListItem("emails", {
                        id: randomId(),
                        value: "",
                      });
                    }}
                  >
                    <IconPlus size={16} />
                  </Button>
                  <Text fz="sm" fs="italic">
                    Note: This will send them a consent email, likely to their
                    junk mail
                  </Text>
                  <Button type="submit" loading={addUsersStatus === "loading"}>
                    Whitelist Emails
                  </Button>
                </Stack>
              </form>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <TextInput
          placeholder="Search User..."
          icon={<IconSearch size={16} />}
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setPage(1);
          }}
          mb="xs"
        />

        <DataTable
          idAccessor="id"
          height={320}
          withBorder
          highlightOnHover
          borderRadius="sm"
          withColumnBorders
          striped
          fetching={isFetching}
          columns={[
            {
              accessor: "username",
              title: "Username",
              sortable: true,
              render: (record) => (
                <Flex align="center" gap="sm" pr="sm">
                  <Image
                    src={record.image || ""}
                    alt={record.username}
                    className="rounded-full"
                    width={20}
                    height={20}
                  />
                  <Text sx={{ lineHeight: 1 }} mr="xs">
                    {record.username}
                  </Text>
                </Flex>
              ),
            },
            {
              accessor: "email",
              title: "Email",
              sortable: true,
              render: ({ email }) => <Code>{email}</Code>,
            },
            {
              accessor: "role",
              sortable: true,
              textAlignment: "center",
              render: ({ role }) => (
                <RoleBadge role={role} {...{ size: "sm" }} />
              ),
            },
            {
              accessor: "emailVerified",
              title: "Verified",
              width: 90,
              render: (record) =>
                record.emailVerified ? (
                  <IconCheck color="green" />
                ) : (
                  <IconX color="red" />
                ),
              visibleMediaQuery: `(min-width: ${theme.breakpoints.xs}px)`,
              sortable: true,
            },
            {
              accessor: "actions",
              title: "",
              render: (record) => (
                <Flex wrap="nowrap">
                  <Tooltip label="Resend Consent Email" withArrow>
                    <ActionIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        sendConsentEmails([record]);
                      }}
                    >
                      <IconMail size={16} />
                    </ActionIcon>
                  </Tooltip>
                  {record.role === Role.USER && (
                    <Tooltip label="Delete User" withArrow>
                      <ActionIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          currentUser.current = record;
                          setConfirmDeleteOpened(true);
                        }}
                      >
                        <IconTrash size={16} color="red" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Flex>
              ),
            },
          ]}
          records={records}
          page={page}
          onPageChange={setPage}
          totalRecords={totalRecords}
          recordsPerPage={PAGE_SIZE}
          // TODO: onRowClick={(record) => {
          //   currentUser.current = record;
          //   setUserEditOpened(true);
          // }}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
          isRecordSelectable={({ role }) => role !== Role.SUPERUSER}
          bodyRef={bodyRef}
        />
      </Container>

      {/* User Delete Confirmation Modal */}
      <Modal
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        size="auto"
        withCloseButton={false}
        centered
      >
        <Group position="apart" align="center">
          <Text weight={500} size="lg">
            Are you sure you want to delete this user?
          </Text>
          <ActionIcon
            variant="transparent"
            color="gray"
            radius="sm"
            onClick={() => setConfirmDeleteOpened(false)}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
        <Text my="md">All their data will be permanently lost.</Text>
        <Button
          fullWidth
          variant="light"
          color="red"
          radius="sm"
          loading={deleteUserStatus === "loading"}
          onClick={() => {
            if (currentUser.current) {
              deleteUser(currentUser.current.email);
            }
            setConfirmDeleteOpened(false);
          }}
        >
          Confirm Delete
        </Button>
      </Modal>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 34,
    fontWeight: 900,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24,
    },
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  modalHeader: {
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[8],
    fontWeight: 700,
  },
  modalContent: {
    maxWidth: 300,
  },
  modalLabel: { width: 80 },
}));
