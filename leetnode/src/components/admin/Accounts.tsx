import axios from "axios";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { RoleBadge } from "@/components/misc/Badges";
import { UsersWithMasteriesAndAttemptsType } from "@/pages/admin";
import {
  Accordion,
  ActionIcon,
  Button,
  Checkbox,
  Code,
  Container,
  createStyles,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { randomId, useDebouncedValue } from "@mantine/hooks";
import { Role } from "@prisma/client";
import {
  IconCheck,
  IconMail,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function Accounts() {
  const { theme } = useStyles();
  const queryClient = useQueryClient();
  const session = useSession();

  const currentUser = useRef<UsersWithMasteriesAndAttemptsType[number]>();
  const [userEditOpened, setUserEditOpened] = useState(false);
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

  const { data: users, isFetching } = useQuery({
    queryKey: ["all-users"],
    queryFn: () =>
      axios.get<UsersWithMasteriesAndAttemptsType>("/api/user/admin"),
  });

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
          if (a.role.length === b.role.length) {
            return a.email.localeCompare(b.email);
          } else {
            return b.role.length - a.role.length;
          }
        } else {
          if (a.role.length === b.role.length) {
            return b.email.localeCompare(a.email);
          } else {
            return a.role.length - b.role.length;
          }
        }
      } else if (sortStatus.columnAccessor === "username") {
        return sortStatus.direction === "asc"
          ? a.username.localeCompare(b.username)
          : b.username.localeCompare(a.username);
      } else if (sortStatus.columnAccessor === "email") {
        return sortStatus.direction === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      } else if (sortStatus.columnAccessor === "isNewUser") {
        if (sortStatus.direction === "asc") {
          return a.isNewUser ? -1 : 1;
        } else {
          return b.isNewUser ? -1 : 1;
        }
      } else if (sortStatus.columnAccessor === "consentDate") {
        if (sortStatus.direction === "asc") {
          return a.consentDate ? -1 : 1;
        } else {
          return b.consentDate ? -1 : 1;
        }
      } else if (sortStatus.columnAccessor === "points") {
        return sortStatus.direction === "asc"
          ? a.points - b.points
          : b.points - a.points;
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
      toSendRecruitmentEmails: true,
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
        toSendRecruitmentEmails: z.boolean(),
      })
    ),
  });

  const editUserForm = useForm<{
    username: string;
    role: Role;
    points: string;
    revokeConsent: boolean;
  }>({
    initialValues: {
      username: "",
      role: Role.USER,
      points: "",
      revokeConsent: false,
    },
    validateInputOnBlur: true,
    validate: zodResolver(
      z.object({
        username: z
          .string()
          .trim()
          .regex(/^([\w.@]+)$/, "No special characters allowed")
          .min(5, "Minimum 5 characters")
          .max(30, "Maximum 30 characters"),
        role: z.nativeEnum(Role),
        points: z
          .string()
          .nonempty("Cannot be empty")
          .pipe(z.coerce.number().int("Must be a whole number").min(0)),
        revokeConsent: z.boolean(),
      })
    ),
  });

  const { mutate: addUsers, status: addUsersStatus } = useMutation({
    mutationFn: ({
      emails,
      toSendRecruitmentEmails,
    }: {
      emails: string[];
      toSendRecruitmentEmails: boolean;
    }) =>
      axios.post("/api/user/admin/add", { emails, toSendRecruitmentEmails }),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
      addUsersForm.reset();
    },
  });

  const { mutate: sendRecruitmentEmails, status: sendRecruitmentEmailsStatus } =
    useMutation({
      mutationFn: (users: UsersWithMasteriesAndAttemptsType) =>
        axios.post("/api/user/admin/sendRecruitmentEmails", {
          emails: users.map((user) => user.email),
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["all-users"]);
        setSelectedRecords([]);
      },
    });

  const { mutate: editUser, status: editUserStatus } = useMutation({
    mutationFn: (values: { username: string; role: Role; points: string }) =>
      axios.put(
        `/api/user/admin/edit?email=${currentUser.current?.email}`,
        values
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
      setUserEditOpened(false);
      editUserForm.reset();
    },
  });

  const { mutate: deleteUser, status: deleteUserStatus } = useMutation({
    mutationFn: (email: string) =>
      axios.delete(`/api/user/admin/delete?email=${email}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
  });

  const { mutate: deleteUsers, status: deleteUsersStatus } = useMutation({
    mutationFn: (emails: string[]) =>
      axios.post("/api/user/admin/deleteMany", { emails }),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
      setSelectedRecords([]);
    },
  });

  return (
    <>
      <Container size="lg">
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
                    addUsers({
                      emails: values.emails.map((email) => email.value),
                      toSendRecruitmentEmails: values.toSendRecruitmentEmails,
                    });
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
                  <Checkbox
                    fz="sm"
                    label="Auto-send recruitment emails, likely to their junk mail"
                    {...addUsersForm.getInputProps("toSendRecruitmentEmails", {
                      type: "checkbox",
                    })}
                  />
                  <Button type="submit" loading={addUsersStatus === "loading"}>
                    Whitelist Emails
                  </Button>
                </Stack>
              </form>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Flex mb="xs" align="center" gap="md">
          <TextInput
            placeholder="Search User..."
            icon={<IconSearch size={16} />}
            sx={{ flex: 1 }}
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setPage(1);
            }}
          />
          <Tooltip label="Refresh Table" withArrow>
            <ActionIcon
              onClick={() => {
                queryClient.invalidateQueries(["all-users"]);
                setSelectedRecords([]);
              }}
              variant="default"
              className="rounded-full"
              disabled={isFetching}
            >
              <IconRefresh size={16} stroke={1.5} color="gray" />
            </ActionIcon>
          </Tooltip>
        </Flex>

        <DataTable
          idAccessor="id"
          height="calc(100vh - 294px)"
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
                    width={30}
                    height={30}
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
              accessor: "isNewUser",
              title: "Login Before",
              render: (record) =>
                record.isNewUser ? (
                  <IconX color="red" />
                ) : (
                  <IconCheck color="green" />
                ),
              sortable: true,
            },
            {
              accessor: "consentDate",
              title: "Consented",
              render: (record) =>
                record.consentDate ? (
                  <IconCheck color="green" />
                ) : (
                  <IconX color="red" />
                ),
              sortable: true,
            },
            {
              accessor: "points",
              sortable: true,
            },
            {
              accessor: "actions",
              title: "",
              render: (record) => (
                <Flex wrap="nowrap">
                  <Tooltip label="Resend Recruitment Email" withArrow>
                    <ActionIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        sendRecruitmentEmails([record]);
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
          onRowClick={(record) => {
            currentUser.current = record;
            editUserForm.setValues({
              username: record.username,
              role: record.role,
              points: record.points.toString(),
            });
            setUserEditOpened(true);
          }}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
        />

        {selectedRecords.length > 0 && (
          <Flex gap="sm" mt="xs" direction={{ base: "column", sm: "row" }}>
            <Button
              fullWidth
              color="cyan"
              loading={
                sendRecruitmentEmailsStatus === "loading" ||
                deleteUsersStatus === "loading"
              }
              onClick={() => {
                sendRecruitmentEmails(selectedRecords);
              }}
            >
              Send Recruitment Email{selectedRecords.length > 1 && "s"} to{" "}
              {selectedRecords.length} User
              {selectedRecords.length > 1 && "s"}
            </Button>
            <Button
              fullWidth
              color="red"
              loading={
                sendRecruitmentEmailsStatus === "loading" ||
                deleteUsersStatus === "loading"
              }
              onClick={() => {
                deleteUsers(selectedRecords.map((r) => r.email));
              }}
            >
              Delete {selectedRecords.length} User
              {selectedRecords.length > 1 && "s"}
            </Button>
          </Flex>
        )}
      </Container>

      {/* User Edit Modal */}
      <Modal
        opened={userEditOpened}
        onClose={() => {
          setUserEditOpened(false);
        }}
        title="Edit User"
        size="auto"
        centered
      >
        <form
          onSubmit={editUserForm.onSubmit(
            (values) => {
              editUser(values);
            },
            (errors) => {
              Object.keys(errors).forEach((key) => {
                toast.error(errors[key] as string);
              });
            }
          )}
        >
          <Stack spacing="md" align="stretch">
            <TextInput
              label="Username (5-30 characters)"
              type="text"
              {...editUserForm.getInputProps("username")}
            />
            <Select
              data={[
                {
                  label: "SUPERUSER",
                  value: Role.SUPERUSER,
                  disabled: session?.data?.user?.role !== Role.SUPERUSER,
                },
                {
                  label: "ADMIN",
                  value: Role.ADMIN,
                },
                {
                  label: "USER",
                  value: Role.USER,
                },
              ]}
              label="Role"
              {...editUserForm.getInputProps("role")}
            />
            <TextInput
              label="Points"
              type="number"
              {...editUserForm.getInputProps("points")}
            />
            <Checkbox
              label="Revoke Consent"
              disabled={currentUser.current?.consentDate === null}
              {...editUserForm.getInputProps("revokeConsent", {
                type: "checkbox",
              })}
            />
            <Button
              type="submit"
              loading={editUserStatus === "loading"}
              color="green"
            >
              Confirm Changes
            </Button>
          </Stack>
        </form>
      </Modal>

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
