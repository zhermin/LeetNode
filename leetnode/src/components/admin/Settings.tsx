import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Carousel } from "@mantine/carousel";
import {
  ActionIcon,
  Affix,
  Avatar,
  Button,
  Checkbox,
  Container,
  createStyles,
  Divider,
  Group,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Attempt, Frequency, Mastery, Role } from "@prisma/client";
import { IconClick, IconEdit, IconTrash } from "@tabler/icons";

interface UsersWithMasteriesAndAttempts {
  id: string;
  nusnetId: string | null;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string;
  lastActive: string;
  emailFrequency: string;
  role: Role;
  masteries: Mastery[];
  attempts: Attempt[];
}
[];

interface TopicsInterface {
  topicLevel: string;
  topicSlug: string;
  topicName: string;
}
[];

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
}));

const Settings = ({
  users,
  topics,
}: {
  users: UsersWithMasteriesAndAttempts[];
  topics: TopicsInterface[];
}) => {
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
  // const [superAdmin, setSuperAdmin] = useState(false);
  const [role, setRole] = useState("USER");
  const [deleteUser, setDeleteUser] = useState<string[]>([]);
  const [closeButton, setCloseButton] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [editField, setEditField] = useState<
    {
      id: string;
      name: string;
      resetAllAttempts: boolean;
      resetTopicAttempts: string[];
    }[]
  >([]);
  const session = useSession();

  const { classes } = useStyles();

  const transformedTopics = topics.map(({ topicSlug, topicName }) => ({
    value: topicSlug,
    label: topicName,
  }));

  // if (
  //   // Change this in the future when SUPERADMIN/similar role is added
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   users.find((user) => user.id === session?.data?.user?.id)?.role ===
  //   "SUPERADMIN"
  // ) {
  //   setSuperAdmin(true);
  // }

  if (selfEmailFreq === null) {
    setSelfEmailFreq(
      users.find((user) => user.id === session?.data?.user?.id)
        ?.emailFrequency as string
    );
  }

  const handleDeleteUser = (userId: string) => {
    deleteUser.some((user) => user === userId)
      ? setDeleteUser(deleteUser.filter((user) => user !== userId))
      : setDeleteUser((previousUsers) => [...previousUsers, userId]);
  };

  const handleEdit = ({ id, name }: { id: string; name: string }) => {
    setToEditId(id);
    if (editField.some((u) => u.id === id)) {
      setToEditName(editField.find((u) => u.id === id)?.name as string);
    } else {
      setToEditName(name);
    }
    setCloseButton(false);
    setEditOpened(true);
  };

  console.log(toEditId);
  console.log(toEditName);
  console.log(editField);
  console.log(selfEmailFreq);

  const handleSubmitChanges = () => {
    axios
      .post("/api/settings/updateEmailFreq", {
        id: session?.data?.user?.id,
        emailFreq: selfEmailFreq,
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));

    if (allAttemptsReset) {
      axios
        .get("/api/settings/resetAllAttempts")
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }
    if (selectedAttemptsResetChecked && topicReset.length > 0) {
      axios
        .post("/api/settings/resetSelectedAttempts", {
          topics: topicReset,
        })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }

    if (editField.length > 0) {
      axios
        .post("/api/settings/resetUserDetails", {
          editField: editField,
        })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }
    if (deleteUser.length > 0) {
      axios
        .post("/api/settings/deleteUser", {
          deleteUser: deleteUser,
        })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    }

    toast.success("Successfully updated!");
  };

  const totalUsersPerPage = 5;

  const adminSlides = users
    .filter((user) => user.role === "ADMIN")
    .reduce((slides: UsersWithMasteriesAndAttempts[][], user, index) => {
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
                      {user.name}
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

  const userSlides = users
    .filter((user) => user.role === "USER")
    .reduce((slides: UsersWithMasteriesAndAttempts[][], user, index) => {
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
                      {user.name}
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
                        handleEdit({ id: user.id, name: user.name });
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
    // editUser.some((user) => user.id === userId)
    // ? setEditUser(editUser.filter((user) => user.id !== userId))
    // : setEditUser([...editUser, { id: userId, changeName, resetAttempt }]);
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
        <Group position="apart">
          <Button onClick={() => setConfirmPopup(false)} color="red">
            No
          </Button>
          <Button
            onClick={() => {
              handleSubmitChanges();
              setConfirmPopup(false);
            }}
            color="green"
          >
            Yes
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={editOpened}
        onClose={() => {
          // for (let i = 0; i < editField.length; i++) {
          //   if (editField[i] && editField[i]?.id === toEditID) {
          //     (editField[i] as { name: string }).name =
          //       textEditValue ?? (editField[i] as { name: string }).name;
          //   }
          // }
          // editField.push({
          //   id: toEditId,
          //   name: toEditName,
          //   resetAllAttempts: allUserAttemptsReset,
          //   resetTopicAttempts: userTopicReset,
          // });
          if (closeButton === false) {
            const existingIndex = editField.findIndex((u) => u.id === toEditId);
            if (existingIndex !== -1) {
              // Update existing object
              const updatedField = [...editField]; // create a copy of editField
              updatedField[existingIndex] = {
                id: toEditId,
                name: toEditName,
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
                  name: toEditName,
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
          // label="Edit Your Email Alert Frequency"
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
        {/* <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftIcon={<IconArrowUp size="1rem" />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              Scroll to top
            </Button>
          )}
        </Transition> */}
        <Button
          leftIcon={<IconClick size={20} />}
          onClick={() => setConfirmPopup(true)}
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
      <Text size={"sm"}>Email Frequency</Text>
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
            // {
            //   value: "SUPERADMIN",
            //   label: "Super Admin",
            //   disabled: !superAdmin,
            // },
            { value: "ADMIN", label: "Admin" },
            { value: "USER", label: "User" },
          ]}
          value={role}
          onChange={setRole}
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
      {role === "USER" ? (
        <Carousel
          mx="auto"
          withIndicators
          height={300}
          classNames={classes}
          mb={80}
        >
          {userSlides}
        </Carousel>
      ) : (
        <Carousel
          mx="auto"
          withIndicators
          height={300}
          classNames={classes}
          mb={80}
        >
          {adminSlides}
        </Carousel>
      )}
    </Container>
  );
};

export default Settings;
