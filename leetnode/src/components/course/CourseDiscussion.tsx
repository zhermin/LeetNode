import axios from "axios";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ForumPost from "@/components/course/ForumPost";
import { CourseTypeBadge, PostTypeBadge } from "@/components/misc/Badges";
import {
  Anchor,
  Avatar,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  Comment,
  Course,
  CourseType,
  Level,
  Post,
  PostLikes,
  PostType,
  Topic,
} from "@prisma/client";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

import DateDiffCalc from "./DateDiffCalc";

const Editor = dynamic(import("@/components/editor/CustomRichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

export type PostFullType = Post & {
  course: Course;
  postLikes: PostLikes[];
  comment: Comment[];
};

export type CourseNamesType = {
  courseName: string;
  type: CourseType;
  courseSlug: string;
  topics: Topic[];
  courseLevel: Level;
};

type ForumUsersType = {
  id: string;
  username: string;
  image: string;
}[];

const CourseDiscussion = ({ courseName }: { courseName: string }) => {
  const queryClient = useQueryClient();

  const [redirect, setRedirect] = useState(false);
  const [message, setMessage] = useState("");
  const [postData, setPostData] = useState<PostFullType | null>(null);
  const [openedPosting, setOpenedPosting] = useState(false);
  const [openedFilter, setOpenedFilter] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredCourseName, setFilteredCourseName] = useState<string | null>(
    courseName
  );
  const [filteredPostType, setFilteredPostType] = useState<"All" | PostType>(
    "All"
  );

  const form = useForm({
    initialValues: {
      title: "",
      courseName: courseName,
      postType: PostType.Content,
    },
    validate: {
      title: (value) => value.trim().length === 0,
    },
  });

  const [
    { data: posts, status: statusPosts },
    { data: courses, status: statusCourses },
    { data: topics, status: statusTopics },
    { data: users, status: statusUsers },
  ] = useQueries({
    queries: [
      {
        queryKey: ["all-posts"],
        queryFn: () => axios.get<PostFullType[]>("/api/forum/getAllPosts"),
      },
      {
        queryKey: ["all-course-names"],
        queryFn: () =>
          axios.get<CourseNamesType[]>("/api/forum/getAllCourseNames"),
      },
      {
        queryKey: ["all-topic-names"],
        queryFn: () => axios.get<Topic[]>("/api/forum/getAllTopicNames"),
      },
      {
        queryKey: ["all-forum-users"],
        queryFn: () => axios.get<ForumUsersType>("/api/forum/getAllForumUsers"),
      },
    ],
  });

  const mutation = useMutation({
    mutationFn: (newPost: {
      title: string;
      message: string;
      courseName: string;
      postType: "All" | PostType;
    }) => axios.post("/api/forum/addPost", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
      form.reset();
      setOpenedPosting(false);
      setMessage("");
    },
  });

  const [slicedPosts, setSlicedPosts] = useState<PostFullType[]>(
    posts?.data.filter((post) => post.courseName === courseName) ?? []
  );
  useEffect(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;

    const filteredPosts =
      posts?.data.filter(
        (post) =>
          post.courseName === filteredCourseName &&
          (filteredPostType === "All" || post.postType === filteredPostType)
      ) ?? [];

    setSlicedPosts(filteredPosts.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredPosts.length / postsPerPage));
  }, [posts, filteredCourseName, filteredPostType, currentPage, postsPerPage]);

  if (
    statusPosts === "error" ||
    statusCourses === "error" ||
    statusTopics === "error" ||
    statusUsers === "error"
  ) {
    return <div>Something went wrong!</div>;
  }

  if (!posts || !courses || !topics || !users) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Loader />
      </Center>
    );
  }

  const coursesArr = courses.data
    .map((course) => {
      return {
        value: course.courseName,
        label: course.courseName,
        group:
          courseName === course.courseName ? "Current Course" : "Other Courses",
      };
    })
    .sort((a, b) => {
      return a.group === "Current Course"
        ? -1
        : b.group === "Current Course"
        ? 1
        : 0;
    });

  return redirect ? (
    <ForumPost
      postId={postData?.postId as string}
      setRedirect={setRedirect}
      users={users.data.map((user) => {
        return {
          id: user.id,
          image: user.image as string,
          value: user.username,
        };
      })}
    />
  ) : (
    <>
      <Title align="center">Discussion Forum</Title>
      <Container size="md" py="lg">
        <Modal
          size="80vw"
          transition="fade"
          transitionDuration={600}
          transitionTimingFunction="ease"
          centered
          overflow="inside"
          opened={openedPosting}
          onClose={() => {
            setOpenedPosting(false);
          }}
          title="Post a Forum Thread"
          styles={(theme) => ({
            title: {
              fontFamily: `Greycliff CF, ${theme.fontFamily}`,
              align: "center",
              fontSize: 25,
            },
          })}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({
                title: form.values.title,
                message: message,
                courseName: form.values.courseName as string,
                postType: form.values.postType,
              });
            }}
          >
            <TextInput
              label="Title"
              placeholder="Discussion Title"
              name="title"
              variant="filled"
              required
              {...form.getInputProps("title")}
            />
            <SimpleGrid
              cols={2}
              mt="lg"
              mb="lg"
              breakpoints={[{ maxWidth: "sm", cols: 1 }]}
            >
              <Select
                data={["Content", "Quiz", "Misc"]}
                placeholder="Choose thread type"
                label="Thread Type"
                defaultValue="Content"
                {...form.getInputProps("postType")}
              />
              <Select
                data={coursesArr}
                placeholder="Choose course"
                label="Course Name"
                defaultValue={courseName}
                {...form.getInputProps("course")}
              />
            </SimpleGrid>
            <Text size="sm" weight={500}>
              Message
            </Text>
            <Editor
              upload_preset="forum_media"
              value={message}
              onChange={setMessage}
            />
            <Group position="center" mt="xl">
              <Button type="submit" size="md" variant="light" fullWidth>
                Submit Discussion
              </Button>
            </Group>
          </form>
        </Modal>
        <Modal
          size="md"
          overlayOpacity={0.3}
          transition="fade"
          transitionDuration={600}
          transitionTimingFunction="ease"
          centered
          overflow="inside"
          opened={openedFilter}
          onClose={() => {
            setOpenedFilter(false);
          }}
          title="Filter Options"
        >
          <Group position="apart" mb="sm">
            <Text>Course</Text>
            <Select
              value={filteredCourseName}
              data={coursesArr}
              onChange={setFilteredCourseName}
              dropdownPosition="bottom"
              size="sm"
            />
          </Group>
          <Group position="apart" mb="sm">
            <Text>Type of Forum Thread</Text>
            <Select
              value={filteredPostType}
              data={["All", "Content", "Quiz", "Misc"]}
              onChange={(value: "All" | PostType) => setFilteredPostType(value)}
              dropdownPosition="bottom"
              size="sm"
            />
          </Group>
        </Modal>
        <Group position="apart" mb="md">
          <Button onClick={() => setOpenedPosting(true)}>+ New Thread</Button>
          <Button onClick={() => setOpenedFilter(true)}>Filter Posts</Button>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Forum Thread</th>
              <th>Comments</th>
              <th>Likes</th>
              <th>Author</th>
              <th>Categories</th>
            </tr>
          </thead>
          <tbody>
            {slicedPosts.map((post) => (
              <tr key={post?.postId}>
                <td>
                  <Anchor
                    onClick={() => {
                      setRedirect(true);
                      setPostData(post);
                    }}
                  >
                    <Text size="lg">{post?.title}</Text>
                  </Anchor>
                  <Group>
                    <Text>
                      {new Date(post?.createdAt as Date).toLocaleDateString(
                        "en-GB"
                      ) +
                        " " +
                        new Date(post?.createdAt as Date).toLocaleString(
                          ["en-GB"],
                          {
                            hour12: true,
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                    </Text>
                    <Divider orientation="vertical" />

                    <Text size="sm" color="dimmed">
                      {DateDiffCalc(post?.createdAt as Date)}
                    </Text>
                  </Group>
                </td>
                <td>{post?.comment.length}</td>
                <td>{post?.likes}</td>
                <td>
                  <Flex gap="sm">
                    <Avatar
                      src={
                        users.data.find((user) => user.id === post?.userId)
                          ?.image
                      }
                      alt={post?.userId}
                      radius="lg"
                      size="sm"
                    />
                    <Text size="sm">
                      {
                        users.data.find((user) => user.id === post?.userId)
                          ?.username
                      }
                    </Text>
                  </Flex>
                </td>
                <td>
                  <Stack align="flex-start">
                    <CourseTypeBadge course={post?.course} />
                    <PostTypeBadge postType={post?.postType} />
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Group position="center" mt="md">
          <Pagination
            page={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            size="md"
            styles={(theme) => ({
              item: {
                "&[data-active]": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.fn.variant({
                          variant: "light",
                          color: theme.primaryColor,
                        }).background
                      : theme.fn.variant({
                          variant: "filled",
                          color: theme.primaryColor,
                        }).background,
                },
              },
            })}
          />
          <Select
            value={postsPerPage.toString()}
            onChange={(value) => {
              setPostsPerPage(Number(value));
              setCurrentPage(1);
            }}
            data={["1", "5", "10", "15", "20"]}
            size="xs"
            styles={() => ({
              root: {
                width: 63,
              },
            })}
          />
        </Group>
      </Container>
    </>
  );
};

export default CourseDiscussion;
