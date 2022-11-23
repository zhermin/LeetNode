import {
  Group,
  Badge,
  Button,
  Text,
  Container,
  Center,
  Loader,
  Title,
  Modal,
  TextInput,
  SimpleGrid,
  Select,
  Pagination,
  Table,
  Avatar,
  Anchor,
} from "@mantine/core";
import RichTextEditor from "@/components/course/RichText";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import ForumPost from "@/components/course/ForumPost";
import { Comment, PostMedia } from "@prisma/client";
import { useForm } from "@mantine/form";
import { useSession } from "next-auth/react";

type postType = {
  postId: string;
  userId: string;
  title: string;
  postType: string;
  message: string;
  likes: number;
  courseSlug: string;
  topicSlug: string;
  createdAt: string;
  updatedAt: string;
  postMedia: PostMedia[];
  comment: Comment[];
} | null;

const CourseDiscussion = ({ courseName }: { courseName: string }) => {
  const [redirect, setRedirect] = useState(false);
  const [postData, setPostData] = useState<postType>(null);
  const [openedPosting, setOpenedPosting] = useState(false);
  const [openedFilter, setOpenedFilter] = useState(false);

  //initialize pagination variables
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState<string | null>("5");
  const [postCourseFilter, setPostCourseFilter] = useState<string | null>(
    courseName
  );
  // const [postTopicFilter, setPostTopicFilter] = useState<string | null>("All");
  const [postTypeFilter, setPostTypeFilter] = useState<string | null>("All");

  const [postCourseFilterStagger, setPostCourseFilterStagger] = useState<
    string | null
  >(courseName);
  // const [postTopicFilterStagger, setPostTopicFilterStagger] = useState<string | null>("All");
  const [postTypeFilterStagger, setPostTypeFilterStagger] = useState<
    string | null
  >("All");

  const session = useSession();
  const queryClient = useQueryClient();

  const [posts, courses, topics] = useQueries({
    queries: [
      {
        queryKey: ["all-posts"],
        queryFn: () => {
          return axios.get("http://localhost:3000/api/forum/getAllPosts");
        },
      },
      {
        queryKey: ["all-course-names"],
        queryFn: () => {
          return axios.get("http://localhost:3000/api/forum/getAllCourseNames");
        },
      },
      {
        queryKey: ["all-topic-names"],
        queryFn: () => {
          return axios.get("http://localhost:3000/api/forum/getAllTopicNames");
        },
      },
    ],
  });

  function handleClick(post: postType) {
    setRedirect(true);
    setPostData(post);
  }

  const handleCloseModal = () => {
    setOpenedFilter(false);
  };
  const handleCloseSubmitModal = () => {
    setPostCourseFilter(postCourseFilterStagger);
    setPostTypeFilter(postTypeFilterStagger);
    setOpenedFilter(false);
  };

  const mutation = useMutation<
    Response,
    AxiosError,
    {
      userId: string;
      title: string;
      message: string;
      course: string;
      postType: string;
    },
    () => void
  >({
    mutationFn: async (newPost) => {
      const res = await axios.post(
        "http://localhost:3000/api/forum/addPost",
        newPost
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
      form.values.message = "";
      form.values.title = "";
      form.values.course = courseName;
      form.values.postType = "Content";
      setOpenedPosting(false);
    },
  });

  const form = useForm({
    initialValues: {
      title: "",
      message: "",
      course: courseName,
      postType: "Content",
    },
    validate: {
      title: (value) => value.trim().length === 0,
      message: (value) => value.trim().length === 0,
    },
  });

  if (
    posts.isLoading ||
    posts.isFetching ||
    !posts ||
    courses.isLoading ||
    courses.isFetching ||
    !courses ||
    topics.isLoading ||
    topics.isFetching ||
    !topics
  )
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (posts.isError || courses.isError || topics.isError)
    return <div>Something went wrong!</div>;

  const indexOfLastPost = currentPage * Number(postsPerPage);
  const indexOfFirstPost = indexOfLastPost - Number(postsPerPage);
  let filteredCoursePosts: string;
  // let filteredTopicPosts;
  let filteredTypePosts;

  // console.log(posts.data.data);
  // console.log(courses.data.data);
  // console.log(topics.data.data);

  //filter by Course
  for (let i = 0; i < courses.data.data.length; i++) {
    if (postCourseFilter === courses.data.data[i].courseName) {
      filteredCoursePosts = courses.data.data[i].courseName;
    } else {
      // console.log(courses.data.data[i].courseName);
    }
  }

  filteredTypePosts = posts.data.data.filter(
    (course: { courseName: string }) =>
      course.courseName === filteredCoursePosts
  );

  //filter by Topic

  //filter by PostType

  postTypeFilter === "All"
    ? (filteredTypePosts = posts.data.data)
    : postTypeFilter === "Content"
    ? (filteredTypePosts = posts.data.data.filter(
        (post: { postType: string }) => post.postType === "Content"
      ))
    : postTypeFilter === "Quiz"
    ? (filteredTypePosts = posts.data.data.filter(
        (post: { postType: string }) => post.postType === "Quiz"
      ))
    : (filteredTypePosts = posts.data.data.filter(
        (post: { postType: string }) => post.postType === "Misc"
      ));

  const currentPosts = filteredTypePosts.slice(
    indexOfFirstPost,
    indexOfLastPost
  );
  const nPages = Math.ceil(posts.data.data.length / Number(postsPerPage));

  //store all courses in array for filter purposes
  const coursesArr = [
    { value: courseName, label: courseName, group: "Current Course" },
  ];
  courses.data.data.map((course: { courseName: string }) => {
    if (course.courseName != courseName) {
      coursesArr.push({
        value: course.courseName,
        label: course.courseName,
        group: "Other Courses",
      });
    }
  });

  console.log(coursesArr);
  return (
    <>
      {redirect ? (
        <ForumPost post={postData} setRedirect={setRedirect} />
      ) : (
        <>
          <Title align="center">Discussion Forum</Title>
          <Container size="md">
            <Modal
              size={"xl"}
              transition="fade"
              transitionDuration={600}
              transitionTimingFunction="ease"
              centered
              overflow="inside"
              opened={openedPosting}
              onClose={() => setOpenedPosting(false)}
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
                    userId: session?.data?.user?.id as string,
                    title: form.values.title,
                    message: form.values.message,
                    course: form.values.course,
                    postType: form.values.postType,
                  });
                }}
              >
                <TextInput
                  label="Title"
                  placeholder="Title"
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
                {/* <Textarea
                  mt="md"
                  label="Message"
                  placeholder="Your message"
                  maxRows={10}
                  minRows={5}
                  autosize
                  name="message"
                  variant="filled"
                  {...form.getInputProps("message")}
                /> */}
                <Text size={"sm"} weight={500}>
                  Message
                </Text>
                <SimpleGrid style={{ minHeight: 250 }}>
                  <RichTextEditor id="rte" />
                </SimpleGrid>
                <Group position="center" mt="xl">
                  <Button type="submit" size="md">
                    Send message
                  </Button>
                </Group>
              </form>
            </Modal>
            <Modal
              transition="fade"
              transitionDuration={600}
              transitionTimingFunction="ease"
              centered
              overflow="inside"
              opened={openedFilter}
              onClose={() => handleCloseSubmitModal()}
              title="Filter Options"
            >
              <Group position="apart" mb={"sm"}>
                <Text>Course</Text>
                <Select
                  value={postCourseFilterStagger}
                  data={coursesArr}
                  onChange={setPostCourseFilterStagger}
                  dropdownPosition="bottom"
                  size="sm"
                  styles={() => ({
                    root: {
                      width: 150,
                    },
                  })}
                />
              </Group>
              <Group position="apart" mb={"sm"}>
                <Text>Type of Forum Thread</Text>
                <Select
                  value={postTypeFilterStagger}
                  data={["All", "Content", "Quiz", "Misc"]}
                  onChange={setPostTypeFilterStagger}
                  dropdownPosition="bottom"
                  size="sm"
                  styles={() => ({
                    root: {
                      width: 150,
                    },
                  })}
                />
              </Group>
              <Group position="apart" mt={"xl"}>
                <Button variant="outline" onClick={() => handleCloseModal()}>
                  Cancel
                </Button>
                <Button onClick={() => handleCloseSubmitModal()}>Ok</Button>
              </Group>
            </Modal>
            <Group position="apart" mb={"md"}>
              <Button onClick={() => setOpenedPosting(true)}>
                Post a Thread
              </Button>
              <Button onClick={() => setOpenedFilter(true)}>
                Filter Options
              </Button>
            </Group>

            <Table sx={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th style={{ width: 400 }}>Forum Thread</th>
                  <th>Comments</th>
                  <th>Likes</th>
                  <th>Author</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.map((post: postType) => (
                  <tr key={post?.postId}>
                    <td>
                      <Anchor onClick={() => handleClick(post)}>
                        <Text size={"lg"}>{post?.title}</Text>
                      </Anchor>
                      <Text>{post?.message}</Text>
                    </td>
                    <td>{post?.comment.length}</td>
                    <td>{post?.likes}</td>
                    <td>
                      <Group>
                        <Avatar></Avatar>
                        <Text>{post?.userId}</Text>
                      </Group>
                    </td>
                    <td>
                      <Badge
                        color={
                          post?.postType === "Content"
                            ? "cyan"
                            : post?.postType === "Quiz"
                            ? "blue"
                            : "gray"
                        }
                        variant="light"
                      >
                        {post?.postType}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Group position="center" mt={"md"}>
              <Pagination
                page={currentPage}
                onChange={setCurrentPage}
                total={nPages}
                size="md"
              />
              <Select
                value={postsPerPage}
                onChange={setPostsPerPage}
                data={["5", "10", "15", "20"]}
                size="sm"
                styles={() => ({
                  root: {
                    width: 55,
                  },
                })}
              />
            </Group>
          </Container>
        </>
      )}
    </>
  );
};

export default CourseDiscussion;
