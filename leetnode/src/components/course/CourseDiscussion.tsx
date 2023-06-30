import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import ForumPost from "@/components/course/ForumPost";
import { CourseTypeBadge, PostTypeBadge } from "@/components/misc/Badges";
import { DateDiffCalc } from "@/utils/DateDiffCalc";
import {
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery, useSessionStorage } from "@mantine/hooks";
import {
  Comment,
  Course,
  CourseType,
  Level,
  Post,
  PostLikes,
  PostType,
  Role,
  Topic,
} from "@prisma/client";
import {
  IconFilter,
  IconHeart,
  IconHourglassHigh,
  IconMessage,
  IconPlus,
  IconUrgent,
} from "@tabler/icons";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

const Editor = dynamic(import("@/components/editor/CustomRichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

export type PostFullType = Post & {
  user: {
    username: string;
    image: string;
    role: Role;
  };
  course: Course;
  postLikes: PostLikes[];
  comment: (Comment & {
    user: {
      username: string;
      image: string | null;
      role: Role;
    };
  })[];
};

export type CourseNamesType = {
  courseName: string;
  type: CourseType;
  courseSlug: string;
  topics: Topic[];
  courseLevel: Level;
};

const CourseDiscussion = ({ courseName }: { courseName: string }) => {
  const queryClient = useQueryClient();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  const [redirect, setRedirect] = useSessionStorage({
    key: "toRedirectToThread",
    defaultValue: false,
  });
  const [postData, setPostData] = useSessionStorage<PostFullType | undefined>({
    key: "discussionPostData",
    defaultValue: undefined,
  });

  const [message, setMessage] = useState("");
  const [openedPosting, setOpenedPosting] = useState(false);
  const [openedFilter, setOpenedFilter] = useState(false);

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
  ] = useQueries({
    queries: [
      {
        queryKey: ["all-posts"],
        queryFn: () => axios.get<PostFullType[]>("/api/forum/getAllPosts"),
        refetchOnWindowFocus: true,
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
    statusTopics === "error"
  ) {
    return <div>Something went wrong!</div>;
  }

  if (!posts || !courses || !topics || statusPosts === "loading") {
    return (
      <Stack spacing="lg">
        {[...Array(3)].map((_, index) => (
          <Paper
            key={index}
            withBorder
            radius="md"
            p="md"
            className="cursor-pointer transition-shadow duration-300 hover:shadow-lg"
          >
            <Flex gap="sm">
              <Skeleton height={16} width="15%" radius="xl" />
              <Skeleton height={16} width="10%" radius="xl" />
            </Flex>
            <Skeleton height={32} width="90%" mt="sm" mb="lg" />
            <Flex gap="sm" align="center" justify="space-between">
              <Flex align="center" gap="sm">
                <Skeleton circle height={32} />
                <Skeleton height={20} width={120} radius="xl" />
              </Flex>
              <Skeleton height={16} width="10%" radius="xl" />
            </Flex>
            <Divider mt="lg" mb="sm" variant="dotted" />
            <Flex align="center" justify="space-between">
              <Flex gap="xs" align="center">
                <IconMessage stroke={1.5} />
                <Skeleton height={16} width={30} radius="xl" />
                <IconHeart stroke={1.5} className="ml-2" color="red" />
                <Skeleton height={16} width={30} radius="xl" />
              </Flex>
              <Skeleton height={16} width="10%" radius="xl" />
            </Flex>
          </Paper>
        ))}
      </Stack>
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
    <ForumPost post={postData} setRedirect={setRedirect} />
  ) : (
    <>
      <Stack spacing="lg">
        {slicedPosts.length > 0 &&
          slicedPosts.map((post) => (
            <Paper
              key={post.postId}
              withBorder
              radius="md"
              p="md"
              className="cursor-pointer transition-shadow duration-300 hover:shadow-lg"
              onClick={() => {
                setRedirect(true);
                setPostData(post);
              }}
            >
              <Flex gap="sm">
                <CourseTypeBadge course={post.course} />
                <PostTypeBadge postType={post.postType} />
              </Flex>
              <Title order={3} weight={500} mt="sm" mb="lg">
                {post.title}
              </Title>
              <Flex gap="sm" align="center" justify="space-between">
                <Flex align="center" gap="sm" pr="sm">
                  <Image
                    src={post.user.image}
                    alt={post.user.username}
                    className="rounded-full"
                    width={30}
                    height={30}
                  />
                  <Text sx={{ lineHeight: 1 }} mr="xs">
                    {post.user.username}
                  </Text>
                </Flex>
                <Flex gap="xs" align="center">
                  <IconUrgent stroke={1} size={16} />
                  <Text size="sm" color="dimmed" fz="xs">
                    {DateDiffCalc(post?.updatedAt as Date)}
                  </Text>
                </Flex>
              </Flex>
              <Divider mt="lg" mb="sm" variant="dotted" />
              <Flex align="center" justify="space-between">
                <Flex gap="xs" align="center">
                  <IconMessage stroke={1.5} />
                  <Text size="sm">{post.comment.length}</Text>
                  <IconHeart stroke={1.5} className="ml-2" color="red" />
                  <Text size="sm">{post.likes}</Text>
                </Flex>
                <Flex gap="xs" align="center">
                  <IconHourglassHigh stroke={1} size={16} />
                  <Text size="sm" color="dimmed" fz="xs">
                    {new Date(post.createdAt).toLocaleString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </Text>
                </Flex>
              </Flex>
            </Paper>
          ))}
      </Stack>

      <Group position="center" mt="xl">
        <Button
          size="xs"
          fw={400}
          variant="default"
          onClick={() => setOpenedPosting(true)}
        >
          <Flex gap="xs" align="center">
            <IconPlus stroke={0.5} />
            {!mobile && <Text>New Thread</Text>}
          </Flex>
        </Button>
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
              width: 52,
            },
          })}
        />
        <Button
          size="xs"
          fw={400}
          variant="default"
          onClick={() => setOpenedFilter(true)}
        >
          <Flex gap="xs" align="center">
            <IconFilter stroke={0.5} />
            {!mobile && <Text>Filter</Text>}
          </Flex>
        </Button>
      </Group>

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
            <Button type="submit" size="sm" variant="light" fullWidth>
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
    </>
  );
};

export default CourseDiscussion;
