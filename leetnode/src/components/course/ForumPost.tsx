import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
// import { useForm } from "@mantine/form";
import { PostMedia, Comment, CommentMedia } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { IconChevronLeft, IconThumbDown, IconThumbUp } from "@tabler/icons";
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
  createdAt: string;
  updatedAt: string;
  postMedia: PostMedia[];
  comment: Comment[];
} | null;

const ForumPost = ({
  post,
  setRedirect,
  users,
}: {
  post: postType;
  setRedirect: Dispatch<SetStateAction<boolean>>;
  users: { id: string; image: string; value: string }[];
}) => {
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState<string | null>("oldest");
  const [voted, setVoted] = useState<number>(0);
  const [displayLikes, setDisplayLikes] = useState<number>();

  const session = useSession();
  const queryClient = useQueryClient();

  const date = new Date(post?.createdAt as string);
  const month = date.toLocaleString("en-US", { month: "long" });
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amOrPm = hours >= 12 ? "pm" : "am";
  const formattedTime = `${hours % 12 || 12}:${minutes}${amOrPm}`;
  const formattedDate = `${date.getDate()} ${month} ${date.getFullYear()} ${formattedTime}`;

  // onChange expects a function with these 4 arguments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // function handleChange(content: any, delta: any, source: any, editor: any) {
  //   setValue(editor.getContents());
  //   form.values.message = value;
  // }

  const {
    data: comments,
    isLoading: isLoadingComments,
    isFetching: isFetchingComments,
    isError: isErrorComments,
  } = useQuery(["post-comments"], async () => {
    const res = await axios.post(
      "http://localhost:3000/api/forum/getAllComments",
      { postId: post?.postId }
    );
    return res.data;
  });

  const {
    data: likes,
    isLoading: isLoadingLikes,
    isFetching: isFetchingLikes,
    isError: isErrorLikes,
  } = useQuery(["post-likes"], async () => {
    const res = await axios.post(
      "http://localhost:3000/api/forum/getPostLikes",
      { postId: post?.postId, userId: session?.data?.user?.id }
    );
    console.log(res.data);
    if (res.data.likes === 1) {
      console.log("set like as 1");
      setVoted(1);
    } else if (res.data.likes === -1) {
      console.log("set like as -1");
      setVoted(-1);
    }
    setDisplayLikes(post?.likes as number);
    return res.data;
  });

  // Use the useQuery hook to make the API call to get all tags
  const {
    data: topics,
    isLoading: isLoadingTopics,
    isFetching: isFetchingTopics,
    isError: isErrorTopics,
  } = useQuery(["all-topics"], async () => {
    const res = await axios.get(
      "http://localhost:3000/api/forum/getAllTopicNames"
    );
    const tags: { value: string }[] = [];
    res.data.map((e: { topicName: string }) => {
      const jsonstr = `{"value":"${e.topicName}"}`;
      tags.push(JSON.parse(jsonstr));
    });
    return tags;
  });

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
        const list = mentionChar === "@" ? users : topics;
        const includesSearchTerm = list?.filter((item: { value: string }) =>
          item.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        {
          if (includesSearchTerm) renderList(includesSearchTerm.slice(0, 5));
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const mutation = useMutation<
    Response,
    AxiosError,
    { postId: string; userId: string; message: string },
    () => void
  >({
    mutationFn: async (newComment) => {
      const res = await axios.post(
        "http://localhost:3000/api/forum/addComment",
        newComment
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
      queryClient.invalidateQueries(["post-comments"]);
      setMessage("");
    },
  });

  function handleBack() {
    setRedirect(false);
    queryClient.invalidateQueries(["all-posts"]);
    queryClient.invalidateQueries(["post-comments"]);
  }

  function handleVote(vote: number): MouseEventHandler<HTMLButtonElement> {
    return async () => {
      const difference = voted - vote;
      setVoted(vote);
      const data = {
        userId: session?.data?.user?.id,
        postId: post?.postId,
        likes: vote,
        newLikes: (displayLikes as number) - difference,
      };
      setDisplayLikes(data.newLikes);
      await axios.post("http://localhost:3000/api/forum/changeLikes", data);
    };
  }

  if (
    isLoadingComments ||
    isFetchingComments ||
    !comments ||
    isLoadingTopics ||
    isFetchingTopics ||
    !topics ||
    isLoadingLikes ||
    isFetchingLikes ||
    !likes
  )
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isErrorComments || isErrorTopics || isErrorLikes)
    return <div>Something went wrong!</div>;

  return (
    <>
      <Box mx="15rem">
        <Button
          onClick={handleBack}
          leftIcon={<IconChevronLeft size={14} />}
          styles={() => ({ leftIcon: { marginLeft: -5 } })}
        >
          Back
        </Button>
        <SimpleGrid cols={2} spacing="md"></SimpleGrid>
        <Group></Group>
        <Box>
          <Title>{post?.title}</Title>
          <Group>
            <Text size="xs" color="dimmed">
              {formattedDate}
            </Text>
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
        </Box>

        <Divider my="sm" />
        <TypographyStylesProvider key={post?.postId}>
          <div
            dangerouslySetInnerHTML={{
              __html: `${post?.message}`,
            }}
          />
        </TypographyStylesProvider>
        <Group position="apart" mt={"4vw"}>
          <Group>
            <ActionIcon
              onClick={voted === 1 ? handleVote(0) : handleVote(1)}
              color={voted === 1 ? "blue" : "gray"}
            >
              <IconThumbUp />
            </ActionIcon>
            <Text size="sm">{displayLikes}</Text>
            <ActionIcon
              onClick={voted === -1 ? handleVote(0) : handleVote(-1)}
              color={voted === -1 ? "red" : "gray"}
            >
              <IconThumbDown />
            </ActionIcon>
          </Group>
          <Flex justify="flex-end" align="flex-end" direction="column">
            <Group>
              <Avatar
                src={
                  users.find((user: { id: string }) => user.id === post?.userId)
                    ?.image
                }
                alt={post?.userId}
                radius="lg"
                size="sm"
              />
              <Text size="sm">
                {
                  users.find((user: { id: string }) => user.id === post?.userId)
                    ?.value
                }
              </Text>
            </Group>
          </Flex>
        </Group>
        <Divider my="sm" />
        <Group position="apart" mt={"xl"}>
          <Title size={"sm"}>Comments</Title>
          <Group>
            <Text>Sort by: </Text>
            <Select
              value={sort}
              data={[
                { value: "oldest", label: "Oldest" },
                { value: "newest", label: "Newest" },
              ]}
              onChange={(value) => {
                setSort(value);
                if (value === "oldest" || value == "newest") {
                  comments.reverse();
                }
              }}
            />
          </Group>
        </Group>
        {comments.map(
          (comment: {
            commentId: string;
            postId: string;
            userId: string;
            message: string;
            likes: number;
            createdAt: string;
            updatedAt: string;
            commentMedia: CommentMedia[];
          }) => (
            <Box key={comment.commentId} mt={4}>
              <Divider my="sm" />
              <Group>
                <Avatar
                  src={
                    users.find(
                      (user: { id: string }) => user.id === comment.userId
                    )?.image
                  }
                  alt={comment.userId}
                  radius="lg"
                  size="sm"
                />
                <Title size="sm">
                  {
                    users.find(
                      (user: { id: string }) => user.id === comment.userId
                    )?.value
                  }
                </Title>
              </Group>
              <TypographyStylesProvider key={comment.commentId}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `${comment.message}`,
                  }}
                />
              </TypographyStylesProvider>
            </Box>
          )
        )}
        {/* <div>
        <div>postId: {post?.postId}</div>
        <div>title: {post?.title}</div>
        <div>userId: {post?.userId}</div>
        <div>Post Type: {post?.postType}</div>
        <TypographyStylesProvider>
          <div
            dangerouslySetInnerHTML={{
              __html: `${post?.message}`,
            }}
          />
        </TypographyStylesProvider>
        <div>CreatedAt: {post?.createdAt}</div>
        <div>UpdatedAt: {post?.updatedAt}</div>
        <div>PostMediaURL: {post?.postMedia?.[0]?.postMediaURL}</div>
      </div>
      <Text pt={"md"}>comments:</Text>
      {comments.map(
        (e: {
          commentId: string;
          postId: string;
          userId: string;
          message: string;
          likes: number;
          createdAt: string;
          updatedAt: string;
          commentMedia: CommentMedia[];
        }) => (
          <TypographyStylesProvider key={e.commentId}>
            <div
              dangerouslySetInnerHTML={{
                __html: `${e.message}`,
              }}
            />
          </TypographyStylesProvider>
        )
      )} */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({
              postId: post?.postId as string,
              userId: session?.data?.user?.id as string,
              message: message,
            });
          }}
        >
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
      </Box>
    </>
  );
};

export default ForumPost;
