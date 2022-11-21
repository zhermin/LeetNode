import {
  Card,
  Group,
  Badge,
  Button,
  Text,
  Container,
  Center,
  Loader,
  Title,
  Modal,
  Textarea,
  TextInput,
  SimpleGrid,
  Select,
  Pagination,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  createdAt: string;
  updatedAt: string;
  postMedia: PostMedia[];
  comment: Comment[];
} | null;

const CourseDiscussion = () => {
  const [redirect, setRedirect] = useState(false);
  const [postData, setPostData] = useState<postType>(null);
  const [opened, setOpened] = useState(false);

  //initialize pagination variables
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState<string | null>("5");
  const [postFilter, setPostFilter] = useState<string | null>("All");

  const session = useSession();
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    isFetching,
    isError,
  } = useQuery(["all-posts"], async () => {
    const res = await axios.get("http://localhost:3000/api/forum/getAllPosts");
    return res.data;
  });

  function handleClick(post: postType) {
    setRedirect(true);
    setPostData(post);
  }

  const mutation = useMutation<
    Response,
    AxiosError,
    { userId: string; title: string; message: string; postType: string },
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
      form.values.postType = "Content";
      setOpened(false);
    },
  });

  const form = useForm({
    initialValues: {
      title: "",
      message: "",
      postType: "Content",
    },
    validate: {
      title: (value) => value.trim().length === 0,
      message: (value) => value.trim().length === 0,
    },
  });

  if (isLoading || isFetching || !posts)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isError) return <div>Something went wrong!</div>;

  const indexOfLastPost = currentPage * Number(postsPerPage);
  const indexOfFirstPost = indexOfLastPost - Number(postsPerPage);
  let filteredPosts;
  {
    postFilter === "All"
      ? (filteredPosts = posts)
      : postFilter === "Content"
      ? (filteredPosts = posts.filter(
          (post: { postType: string }) => post.postType === "Content"
        ))
      : postFilter === "Quiz"
      ? (filteredPosts = posts.filter(
          (post: { postType: string }) => post.postType === "Quiz"
        ))
      : (filteredPosts = posts.filter(
          (post: { postType: string }) => post.postType === "Misc"
        ));
  }
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const nPages = Math.ceil(posts.length / Number(postsPerPage));

  return (
    <>
      {redirect ? (
        <ForumPost post={postData} setRedirect={setRedirect} />
      ) : (
        <>
          <Title align="center">Discussion Forum</Title>
          <Container size="md">
            <Modal
              transition="fade"
              transitionDuration={600}
              transitionTimingFunction="ease"
              centered
              overflow="inside"
              opened={opened}
              onClose={() => setOpened(false)}
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
                    postType: form.values.postType,
                  });
                }}
              >
                <SimpleGrid
                  cols={2}
                  mt="xl"
                  breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                >
                  <TextInput
                    label="Title"
                    placeholder="Title"
                    name="title"
                    variant="filled"
                    {...form.getInputProps("title")}
                  />
                  <Select
                    data={["Content", "Quiz", "Misc"]}
                    placeholder="Choose thread type"
                    label="Thread Type"
                    defaultValue="Content"
                    {...form.getInputProps("postType")}
                  />
                </SimpleGrid>
                <Textarea
                  mt="md"
                  label="Message"
                  placeholder="Your message"
                  maxRows={10}
                  minRows={5}
                  autosize
                  name="message"
                  variant="filled"
                  {...form.getInputProps("message")}
                />

                <Group position="center" mt="xl">
                  <Button type="submit" size="md">
                    Send message
                  </Button>
                </Group>
              </form>
            </Modal>
            <Group position="apart">
              <Button onClick={() => setOpened(true)}>Post a Thread</Button>
              <Select
                value={postFilter}
                data={["All", "Content", "Quiz", "Misc"]}
                onChange={setPostFilter}
                dropdownPosition="bottom"
                size="sm"
                styles={() => ({
                  root: {
                    width: 150,
                  },
                })}
              />
            </Group>

            {currentPosts.map((post: postType) => (
              <Card
                shadow="sm"
                p="md"
                radius="md"
                withBorder
                key={post?.postId}
                mt="lg"
              >
                <Group position="apart" mb="xs">
                  <Text weight={500}>{post?.title}</Text>
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
                </Group>

                <Text size="sm" color="dimmed">
                  {post?.message}
                </Text>
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => handleClick(post)}
                >
                  See Discussion Thread
                </Button>
              </Card>
            ))}
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
