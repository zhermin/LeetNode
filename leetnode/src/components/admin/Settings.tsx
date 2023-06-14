import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

import { UsersWithMasteriesAndAttemptsType } from "@/pages/admin";
import { Carousel } from "@mantine/carousel";
import {
  ActionIcon,
  Affix,
  Avatar,
  Button,
  Center,
  Checkbox,
  Container,
  createStyles,
  Divider,
  Group,
  Loader,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Frequency, Role, Topic } from "@prisma/client";
import { IconClick, IconEdit, IconTrash } from "@tabler/icons";
import { useQueries } from "@tanstack/react-query";

const Settings = () => {
  const [selectedAttemptsResetChecked, setSelectedAttemptsResetChecked] =
    useState(false);
  const [selfEmailFreq, setSelfEmailFreq] = useState<string | null>(null);
  const [allAttemptsReset, setAllAttemptsReset] = useState(false);
  const [topicReset, setTopicReset] = useState<string[]>([]);
  const [
    selectedUserAttemptsResetChecked,
    setSelectedUserAttemptsResetChecked,
  ] = useState(false);
  const [allUserAttemptsReset, setAllUserAttemptsReset] = useState(false);
  const [userTopicReset, setUserTopicReset] = useState<string[]>([]);
  const [toEditName, setToEditName] = useState("");
  const [editOpened, setEditOpened] = useState(false);
  const [toEditId, setToEditId] = useState("");
  const [roleView, setRoleView] = useState("userView");
  const [deleteUser, setDeleteUser] = useState<string[]>([]);
  const [closeButton, setCloseButton] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [editField, setEditField] = useState<
    {
      id: string;
      username: string;
      resetAllAttempts: boolean;
      resetTopicAttempts: string[];
    }[]
  >([]);
  const session = useSession();

  const { classes } = useStyles();

  const [{ data: users }, { data: topics }] = useQueries({
    queries: [
      {
        queryKey: ["all-users"],
        queryFn: () =>
          axios.get<UsersWithMasteriesAndAttemptsType>("/api/user/admin"),
      },
      {
        queryKey: ["all-topics"],
        queryFn: () => axios.get<Topic[]>("/api/topic"),
      },
    ],
  });

  if (!users || !topics) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  const transformedTopics = topics.data.map(({ topicSlug, topicName }) => ({
    value: topicSlug,
    label: topicName,
  }));

  if (selfEmailFreq === null) {
    setSelfEmailFreq(
      users.data.find((user) => user.id === session?.data?.user?.id)
        ?.emailFrequency as string
    );
  }

  const handleDeleteUser = (userId: string) => {
    deleteUser.some((user) => user === userId)
      ? setDeleteUser(deleteUser.filter((user) => user !== userId))
      : setDeleteUser((previousUsers) => [...previousUsers, userId]);
  };

  const handleEdit = ({ id, username }: { id: string; username: string }) => {
    setToEditId(id);
    if (editField.some((u) => u.id === id)) {
      setToEditName(editField.find((u) => u.id === id)?.username as string);
    } else {
      setToEditName(username);
    }
    setCloseButton(false);
    setEditOpened(true);
  };

  // TODO: Change .then to async/await
  const handleSubmitChanges = () => {
    axios
      .post("/api/admin/settings/updateEmailFreq", {
        id: session?.data?.user?.id,
        emailFreq: selfEmailFreq,
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));

    if (allAttemptsReset) {
      axios
        .get("/api/admin/settings/resetAllAttempts")
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }
    if (selectedAttemptsResetChecked && topicReset.length > 0) {
      axios
        .post("/api/admin/settings/resetSelectedAttempts", {
          topics: topicReset,
        })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }

    if (editField.length > 0) {
      axios
        .post("/api/admin/settings/resetUserDetails", {
          editField: editField,
        })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }
    if (deleteUser.length > 0) {
      axios
        .post("/api/admin/settings/deleteUser", {
          deleteUser: deleteUser,
        })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }

    toast.success("Successfully updated!");
  };

  const totalUsersPerPage = 5;

  const adminSlides = users.data
    .filter((user) => user.role === Role.SUPERUSER || user.role === Role.ADMIN)
    .reduce((slides: UsersWithMasteriesAndAttemptsType[], user, index) => {
      const slideIndex = Math.floor(index / totalUsersPerPage);
      if (!slides[slideIndex]) {
        slides[slideIndex] = [];
      }
      slides[slideIndex]?.push(user);
      return slides;
    }, [])
    .map((usersInSlide, slideIndex) => (
      <Carousel.Slide key={slideIndex} size="100%">
        <Table mx={50}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Attempts</th>
            </tr>
          </thead>
          <tbody>
            {usersInSlide.map((user) => (
              <tr key={user.id}>
                <td>
                  <Group spacing="sm">
                    <Avatar size={26} src={user.image} radius={26} />
                    <Text size="sm" weight={500}>
                      {user.username}
                    </Text>
                  </Group>
                </td>
                <td>{user.attempts.length}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Carousel.Slide>
    ));

  const userSlides = users.data
    .filter((user) => user.role === Role.USER)
    .reduce((slides: UsersWithMasteriesAndAttemptsType[], user, index) => {
      const slideIndex = Math.floor(index / totalUsersPerPage);
      if (!slides[slideIndex]) {
        slides[slideIndex] = [];
      }
      slides[slideIndex]?.push(user);
      return slides;
    }, [])
    .map((usersInSlide, slideIndex) => (
      <Carousel.Slide key={slideIndex} size="100%">
        <Table mx={50}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Attempts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersInSlide.map((user) => (
              <tr key={user.id}>
                <td>
                  <Group spacing="sm">
                    <Avatar size={26} src={user.image} radius={26} />
                    <Text size="sm" weight={500}>
                      {user.username}
                    </Text>
                  </Group>
                </td>
                <td>{user.attempts.length}</td>
                <td>
                  <Group>
                    <ActionIcon
                      variant={
                        deleteUser.some((u) => u === user.id)
                          ? "filled"
                          : "default"
                      }
                      color={deleteUser.some((u) => u === user.id) ? "red" : ""}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                    <ActionIcon
                      variant={
                        editField.some((u) => u.id === user.id)
                          ? "filled"
                          : "default"
                      }
                      color={
                        editField.some((u) => u.id === user.id) ? "blue" : ""
                      }
                      onClick={() => {
                        handleEdit({
                          id: user.id,
                          username: user.username,
                        });
                      }}
                    >
                      <IconEdit size="1rem" />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Carousel.Slide>
    ));

  return (
    <Container>
      <Modal
        opened={confirmPopup}
        onClose={() => {
          setConfirmPopup(false);
        }}
        title="Confirm Changes?"
        zIndex={201}
        centered
      >
        <Group grow>
          <Button
            onClick={() => {
              handleSubmitChanges();
              setConfirmPopup(false);
            }}
            color="green"
          >
            Confirm
          </Button>
          <Button onClick={() => setConfirmPopup(false)} color="red">
            Cancel
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={editOpened}
        onClose={() => {
          if (closeButton === false) {
            const existingIndex = editField.findIndex((u) => u.id === toEditId);
            if (existingIndex !== -1) {
              // Update existing object
              const updatedField = [...editField]; // create a copy of editField
              updatedField[existingIndex] = {
                id: toEditId,
                username: toEditName,
                resetAllAttempts: allUserAttemptsReset,
                resetTopicAttempts: userTopicReset,
              };
              setEditField(updatedField); // update state variable using setEditField
            } else {
              // Add new object
              setEditField((prevFields) => [
                ...prevFields,
                {
                  id: toEditId,
                  username: toEditName,
                  resetAllAttempts: allUserAttemptsReset,
                  resetTopicAttempts: userTopicReset,
                },
              ]);
            }
          }
          setEditOpened(false);
        }}
        title="Additional User Settings"
        zIndex={201}
      >
        <Text mt={"md"}>Name</Text>
        <TextInput
          value={toEditName}
          onChange={(event) => {
            setToEditName(event.currentTarget.value);
          }}
          mb={"md"}
        />
        <Checkbox
          my="sm"
          label="Reset All User's Attempts"
          checked={allUserAttemptsReset}
          disabled={selectedUserAttemptsResetChecked}
          onChange={(event) => {
            setAllUserAttemptsReset(event.currentTarget.checked);
          }}
        />
        <Checkbox
          my="sm"
          label="Reset User's Attempts for Selected Topics"
          checked={selectedUserAttemptsResetChecked}
          disabled={allUserAttemptsReset}
          onChange={(event) =>
            setSelectedUserAttemptsResetChecked(event.currentTarget.checked)
          }
        />
        <MultiSelect
          my="sm"
          disabled={!selectedUserAttemptsResetChecked}
          placeholder="Scroll to see all options"
          data={transformedTopics}
          value={userTopicReset}
          searchable
          onChange={setUserTopicReset}
          maxDropdownHeight={160}
          w={250}
        />
        <Button
          onClick={() => {
            setCloseButton(true);
            setEditField(editField.filter((u) => u.id !== toEditId));
            setAllUserAttemptsReset(false);
            setSelectedUserAttemptsResetChecked(false);
            setUserTopicReset([]);
            setEditOpened(false);
          }}
        >
          Cancel Edits
        </Button>
      </Modal>
      <Affix position={{ bottom: 75, right: 40 }}>
        <Button
          leftIcon={<IconClick size={20} />}
          onClick={() => setConfirmPopup(true)}
          className={classes.control}
        >
          Confirm Changes
        </Button>
      </Affix>
      <Title order={2}> Settings Panel</Title>
      <Divider
        my="md"
        label={
          <Text size={"lg"} fw={600}>
            General
          </Text>
        }
      />
      <Select
        my="sm"
        label="Edit Your Email Alert Frequency"
        placeholder="Choose your alert frequency"
        data={Object.keys(Frequency).map((key) => ({
          label: Frequency[key as keyof typeof Frequency],
          value: key,
        }))}
        value={selfEmailFreq}
        onChange={setSelfEmailFreq}
        w={250}
      />
      <Divider
        my="md"
        label={
          <Text size={"lg"} fw={600}>
            Course
          </Text>
        }
      />
      <Checkbox
        my="sm"
        label="Reset All Attempts"
        checked={allAttemptsReset}
        disabled={selectedAttemptsResetChecked}
        onChange={(event) => setAllAttemptsReset(event.currentTarget.checked)}
      />
      <Checkbox
        my="sm"
        label="Reset All Attempts for Selected Topics"
        checked={selectedAttemptsResetChecked}
        disabled={allAttemptsReset}
        onChange={(event) =>
          setSelectedAttemptsResetChecked(event.currentTarget.checked)
        }
      />
      <MultiSelect
        my="sm"
        disabled={!selectedAttemptsResetChecked}
        // label="Edit Your Email Alert Frequency"
        placeholder="Scroll to see all options"
        data={transformedTopics}
        value={topicReset}
        searchable
        onChange={setTopicReset}
        maxDropdownHeight={160}
        w={250}
      />
      <Divider
        my="md"
        label={
          <Text size={"lg"} fw={600}>
            Users
          </Text>
        }
      />
      <Group>
        <SegmentedControl
          data={[
            { value: "adminView", label: "Admins" },
            { value: "userView", label: "Users" },
          ]}
          value={roleView}
          onChange={setRoleView}
        />

        <ActionIcon variant={"filled"} color={"red"}>
          <IconTrash size="1rem" />
        </ActionIcon>
        <Text fw={500}>- To be deleted</Text>
        <ActionIcon variant={"filled"} color={"blue"}>
          <IconEdit size="1rem" />
        </ActionIcon>
        <Text fw={500}>- To be edited</Text>
      </Group>
      {roleView === "adminView" ? (
        <Carousel
          mx="auto"
          withIndicators
          height={300}
          classNames={classes}
          mb={80}
        >
          {adminSlides}
        </Carousel>
      ) : (
        <Carousel
          mx="auto"
          withIndicators
          height={300}
          classNames={classes}
          mb={80}
        >
          {userSlides}
        </Carousel>
      )}
    </Container>
  );
};

export default Settings;

const useStyles = createStyles((_theme, _params, getRef) => ({
  controls: {
    ref: getRef("controls"),
    transition: "opacity 150ms ease",
    opacity: 0,
  },

  root: {
    "&:hover": {
      [`& .${getRef("controls")}`]: {
        opacity: 1,
      },
    },
  },

  control: {
    backgroundColor:
      _theme.colorScheme === "dark"
        ? _theme.fn.variant({
            variant: "light",
            color: _theme.primaryColor,
          }).background
        : _theme.fn.variant({
            variant: "filled",
            color: _theme.primaryColor,
          }).background,
    color:
      _theme.colorScheme === "dark"
        ? _theme.fn.variant({ variant: "light", color: _theme.primaryColor })
            .color
        : _theme.fn.variant({ variant: "filled", color: _theme.primaryColor })
            .color,
  },
}));
