import "react-quill/dist/quill.snow.css";

import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import ForumPost from "@/components/course/ForumPost";
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Comment, PostMedia } from "@prisma/client";
import {
  QueryKey,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import DateDiffCalc from "./DateDiffCalc";

const QuillNoSSRWrapper = dynamic(import("@mantine/rte"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

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

  const [message, setMessage] = useState("");

  const session = useSession();
  const queryClient = useQueryClient();

  const handleImageUpload = useCallback(
    (file: File): Promise<string> =>
      new Promise(async (resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "w2ul1sgu");
        try {
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload",
            formData
          ); //use data destructuring to get data from the promise object
          resolve(res.data.secure_url);
        } catch (error) {
          console.log(error);
          reject(error);
        }
      }),

    []
  );

  const people: { value: string }[] = [];
  axios.get("/api/forum/getAllUsers").then((res) => {
    res.data.map((e: { name: string }) => {
      const jsonstr = `{"value":"${e.name}"}`;
      people.push(JSON.parse(jsonstr));
    });
  });

  const tags: { value: string }[] = [];
  axios.get("/api/forum/getAllTopicNames").then((res) => {
    res.data.map((e: { topicName: string }) => {
      const jsonstr = `{"value":"${e.topicName}"}`;
      tags.push(JSON.parse(jsonstr));
    });
  });

  const mentions = useMemo(
    () => ({
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@", "#"],
      defaultMenuOrientation: "top",
      source: (
        searchTerm: string,
        renderList: (arg0: { value: string }[]) => void,
        mentionChar: string
      ) => {
        const list = mentionChar === "@" ? people : tags;
        const includesSearchTerm = list.filter((item) =>
          item.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        renderList(includesSearchTerm.slice(0, 5));
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [posts, courses, topics] = useQueries({
    queries: [
      {
        queryKey: ["all-posts"],
        queryFn: () => {
          return axios.get("/api/forum/getAllPosts");
        },
      },
      {
        queryKey: ["all-course-names"],
        queryFn: () => {
          return axios.get("/api/forum/getAllCourseNames");
        },
      },
      {
        queryKey: ["all-topic-names"],
        queryFn: () => {
          return axios.get("/api/forum/getAllTopicNames");
        },
      },
    ],
  });

  // Use the useQuery hook to make the API call to get all users
  const {
    data: users,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isErrorUsers,
  } = useQuery(["all-users"], async () => {
    const res = await axios.get("/api/forum/getAllUsers");
    const people: { id: string; image: string; value: string }[] = [];
    res.data.map((e: { name: string; id: string; image: string }) => {
      const jsonstr = `{"id":"${e.id}","image":"${e.image}","value":"${e.name}"}`;
      people.push(JSON.parse(jsonstr));
    });
    return people;
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
      courseName: string;
      postType: string;
    },
    () => void
  >({
    mutationFn: async (newPost) => {
      const res = await axios.post("/api/forum/addPost", newPost);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
      form.values.title = "";
      form.values.courseName = courseName;
      form.values.postType = "Content";
      setOpenedPosting(false);
      setMessage("");
    },
  });

  const form = useForm({
    initialValues: {
      title: "",
      courseName: courseName,
      postType: "Content",
    },
    validate: {
      title: (value) => value.trim().length === 0,
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
    !topics ||
    isLoadingUsers ||
    isFetchingUsers ||
    !users
  )
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (posts.isError || courses.isError || topics.isError || isErrorUsers)
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
  const nPages = Math.ceil(filteredTypePosts.length / Number(postsPerPage));

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

  return (
    <>
      {redirect ? (
        <ForumPost
          postId={postData?.postId as string}
          setRedirect={setRedirect}
          users={users}
        />
      ) : (
        <>
          <Title align="center">Discussion Forum</Title>
          <Container size="md">
            <Modal
              size={"50vw"}
              transition="fade"
              transitionDuration={600}
              transitionTimingFunction="ease"
              centered
              overflow="inside"
              opened={openedPosting}
              onClose={() => {
                setOpenedPosting(false);
                setMessage("");
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
                    userId: session?.data?.user?.id as string,
                    title: form.values.title,
                    message: message,
                    courseName: form.values.courseName,
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
                <Text size={"sm"} weight={500}>
                  Message
                </Text>
                <QuillNoSSRWrapper
                  // modules={modules}
                  value={message}
                  onChange={setMessage}
                  onImageUpload={handleImageUpload}
                  mentions={mentions}
                  styles={{
                    toolbar: {
                      zIndex: 0,
                    },
                  }}
                />
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
                  <th>Forum Thread</th>
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
                      <Anchor
                        onClick={() => {
                          handleClick(post);
                          form.values.title = "";
                          form.values.courseName = courseName;
                          form.values.postType = "Content";
                          setMessage("");
                        }}
                      >
                        <Text size={"lg"}>{post?.title}</Text>
                      </Anchor>
                      <Group>
                        <Text>
                          {new Date(
                            post?.createdAt as string
                          ).toLocaleDateString("en-GB") +
                            " " +
                            new Date(post?.createdAt as string).toLocaleString(
                              ["en-GB"],
                              {
                                hour12: true,
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                        </Text>
                        <Divider orientation="vertical" />

                        <Text size={"sm"} color={"cyan.7"}>
                          {DateDiffCalc(post?.createdAt as string)}
                        </Text>
                      </Group>
                    </td>
                    <td>{post?.comment.length}</td>
                    <td>{post?.likes}</td>
                    <td>
                      <Group>
                        <Avatar
                          src={
                            users.find((user) => user.id === post?.userId)
                              ?.image
                          }
                          alt={post?.userId}
                          radius="lg"
                          size="sm"
                        />
                        <Text size="sm">
                          {
                            users.find((user) => user.id === post?.userId)
                              ?.value
                          }
                        </Text>
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
                    width: 63,
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

export const useGetFetchQuery = (key: QueryKey) => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(key);
};

export default CourseDiscussion;
