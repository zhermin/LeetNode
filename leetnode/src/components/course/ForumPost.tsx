import {
  ActionIcon,
  Avatar,
  Badge,
  Blockquote,
  Box,
  Button,
  Center,
  createStyles,
  CSSObject,
  Divider,
  Flex,
  Group,
  keyframes,
  Loader,
  MantineTheme,
  NavLink,
  Popover,
  Select,
  SimpleGrid,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { PostMedia, Comment, CommentMedia } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import DateDiffCalc from "./DateDiffCalc";
import {
  IconChevronLeft,
  IconCornerDownRight,
  IconDotsVertical,
  IconThumbDown,
  IconThumbUp,
  IconX,
} from "@tabler/icons";
import { useGetFetchQuery } from "./CourseDiscussion";
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

export const flash = keyframes({
  from: { backgroundColor: "rgb(141, 152, 166)" },
  to: { backgroundColor: "none" },
});

const useStyles = createStyles(() => ({
  flash: {
    animationName: `${flash}`,
    animationDuration: "1.5s",
    animationIterationCount: "initial",
  },
}));

const ForumPost = ({
  postId,
  setRedirect,
  users,
}: {
  postId: string;
  setRedirect: Dispatch<SetStateAction<boolean>>;
  users: { id: string; image: string; value: string }[];
}) => {
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState<string | null>("oldest");
  const [voted, setVoted] = useState<number>(0);
  const [displayLikes, setDisplayLikes] = useState<number>();
  const [replying, setReplying] = useState<string | null>();
  const [edit, setEdit] = useState<string | null>();
  const [postOpened, setPostOpened] = useState(false);
  const [commentOpened, setCommentOpened] = useState(false);
  const [commentEdit, setCommentEdit] = useState<string | null>();
  const [goToComment, setGoToComment] = useState<string | null>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setGoToComment(null); // Update goToComment to null after a delay
    }, 1250); // Delay by 1.25 seconds (1250 milliseconds)

    return () => clearTimeout(timer); // Clear the timer when the component unmounts
  }, [goToComment]);

  const session = useSession();
  const queryClient = useQueryClient();

  const { classes } = useStyles();

  function formatIsoDateTime(isoDateTime: string): string {
    const date = new Date(isoDateTime);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "numeric",
    });
    return `${formattedDate} ${formattedTime}`;
  }

  // onChange expects a function with these 4 arguments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // function handleChange(content: any, delta: any, source: any, editor: any) {
  //   setValue(editor.getContents());
  //   form.values.message = value;
  // }

  const data = useGetFetchQuery(["all-posts"]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore -> react query can only provide generic type of unknown, hence will throw error
  const post: postType = data.data.find(
    (e: { postId: string }) => e.postId === postId
  );

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
      allowedChars: /^[A-Za-z\s????????????]*$/,
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

  const addMutation = useMutation<
    Response,
    AxiosError,
    { postId: string; userId: string; message: string; reply: unknown },
    () => void
  >({
    mutationFn: async (newComment) => {
      console.log(newComment);
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
      setReplying(null);
    },
  });

  const editCommentMutation = useMutation<
    Response,
    AxiosError,
    { commentId: string; message: string },
    () => void
  >({
    mutationFn: async (editComment) => {
      console.log(editComment);
      const res = await axios.post(
        "http://localhost:3000/api/forum/editComment",
        editComment
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["post-comments"]);
      setMessage("");
      setReplying(null);
      setEdit(null);
    },
  });

  const editPostMutation = useMutation<
    Response,
    AxiosError,
    { postId: string; message: string },
    () => void
  >({
    mutationFn: async (editPost) => {
      console.log(editPost);
      const res = await axios.post(
        "http://localhost:3000/api/forum/editPost",
        editPost
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
      queryClient.invalidateQueries(["post-comments"]);
      setMessage("");
      setReplying(null);
      setEdit(null);
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

  function handleReply(commentId: string) {
    setReplying(commentId);
  }

  function handleEdit(commentId: string) {
    setEdit(commentId);
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

  console.log(goToComment);

  return (
    <Box
      sx={() => ({
        maxWidth: "45vw",
        margin: "auto",
      })}
    >
      <Button
        onClick={handleBack}
        leftIcon={<IconChevronLeft size={14} />}
        styles={() => ({ leftIcon: { marginLeft: -5 } })}
      >
        Back
      </Button>
      <SimpleGrid cols={2} spacing="md"></SimpleGrid>

      <Title>{post?.title}</Title>
      <Group position="apart">
        <Group>
          <Text size="xs" color="dimmed">
            {formatIsoDateTime(post?.createdAt as string)}
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
        <Popover
          width={100}
          position="bottom"
          withArrow
          shadow="md"
          opened={postOpened}
          onChange={setPostOpened}
        >
          <Popover.Target>
            <ActionIcon size={"sm"}>
              <IconDotsVertical onClick={() => setPostOpened((o) => !o)} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown p={0}>
            {post?.userId === session?.data?.user?.id ? (
              <NavLink
                label="Edit"
                onClick={() => {
                  handleEdit(post?.postId as string);
                  setMessage(post?.message as string);
                  setPostOpened(false);
                }}
              />
            ) : (
              ""
            )}
          </Popover.Dropdown>
        </Popover>
      </Group>

      <Divider my="sm" />
      {edit === post?.postId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editPostMutation.mutate({
              postId: edit as string,
              message: message,
            });
          }}
        >
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
            <Button type="submit">Edit message</Button>
            <Button
              onClick={() => {
                setEdit(null);
              }}
            >
              Cancel
            </Button>
          </Group>
        </form>
      ) : (
        <TypographyStylesProvider key={post?.postId}>
          <div
            dangerouslySetInnerHTML={{
              __html: `${post?.message}`,
            }}
          />
        </TypographyStylesProvider>
      )}
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
          <>
            {post?.createdAt !== post?.updatedAt ? (
              <Divider orientation="vertical" />
            ) : (
              ""
            )}
            {post?.createdAt !== post?.updatedAt ? (
              <Text size={"sm"} color={"cyan.7"}>
                Updated {DateDiffCalc(post?.updatedAt as string)}
              </Text>
            ) : (
              ""
            )}
          </>
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
          reply: string;
          commentMedia: CommentMedia[];
        }) => (
          <Box key={comment.commentId} id={comment.commentId} mt={4}>
            <Divider my="sm" />
            <Group position="apart">
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
              <Popover
                width={100}
                position="bottom"
                withArrow
                shadow="md"
                opened={commentEdit === comment.commentId && commentOpened}
                onChange={setCommentOpened}
              >
                <Popover.Target>
                  <ActionIcon size={"sm"}>
                    <IconDotsVertical
                      onClick={() => {
                        setCommentOpened((o) => !o);
                        setCommentEdit(comment.commentId);
                      }}
                    />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  {comment?.userId === session?.data?.user?.id ? (
                    <NavLink
                      label="Edit"
                      onClick={() => {
                        handleEdit(comment?.commentId);
                        setMessage(comment.message);
                        setCommentOpened(false);
                      }}
                    />
                  ) : (
                    ""
                  )}
                  <NavLink
                    label="Reply"
                    onClick={() => {
                      handleReply(comment?.commentId);
                      setCommentOpened(false);
                    }}
                  />
                </Popover.Dropdown>
              </Popover>
            </Group>
            {edit === comment.commentId ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editCommentMutation.mutate({
                    commentId: edit as string,
                    message: message,
                  });
                }}
              >
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
                    Edit message
                  </Button>
                  <Button onClick={() => setEdit(null)}>Cancel</Button>
                </Group>
              </form>
            ) : comment.reply !== null ? (
              <>
                <Box
                  sx={() => ({
                    wordWrap: "break-word",
                  })}
                >
                  <Box
                    sx={replyBoxStyles}
                    mb="sm"
                    onClick={() => {
                      setGoToComment(comment.reply);
                      document.getElementById(comment.reply)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    <Text
                      ml={"xl"}
                      mt={"md"}
                      sx={(theme) => ({
                        fontWeight: "bold",
                        fontStyle: "normal",
                        color: theme.colors.gray[6],
                      })}
                    >
                      {
                        users.find(
                          (user) =>
                            user["id"] ===
                            comments.find(
                              (e: {
                                commentId: string;
                                reply: string | null;
                              }) => e.commentId === comment.reply
                            ).userId
                        )?.value
                      }
                    </Text>
                    <Blockquote
                      icon={<IconCornerDownRight size={"lg"} />}
                      styles={{
                        body: {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          lineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        },
                      }}
                    >
                      <TypographyStylesProvider
                        key={comment.commentId}
                        sx={(theme) => ({
                          color: theme.colors.gray[6],
                        })}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `${
                              comments.find(
                                (e: {
                                  commentId: string;
                                  reply: string | null;
                                }) => e.commentId === comment.reply
                              ).message
                            }`,
                          }}
                        />
                      </TypographyStylesProvider>
                    </Blockquote>
                  </Box>
                  <Text styles={{ body: { wordWrap: "break-word" } }}>
                    <TypographyStylesProvider
                      key={comment.commentId}
                      className={
                        goToComment === comment.commentId
                          ? classes.flash
                          : undefined
                      }
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `${comment.message}`,
                        }}
                      />
                    </TypographyStylesProvider>
                  </Text>
                </Box>
              </>
            ) : (
              <Text styles={{ body: { wordWrap: "break-word" } }}>
                <TypographyStylesProvider
                  key={comment.commentId}
                  className={
                    goToComment === comment.commentId
                      ? classes.flash
                      : undefined
                  }
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `${comment.message}`,
                    }}
                  />
                </TypographyStylesProvider>
              </Text>
            )}
            <Group mt={"md"}>
              <Text size="xs" color="dimmed">
                {formatIsoDateTime(comment?.createdAt as string)}
              </Text>
              {Date.parse(comment?.createdAt) <
              Date.parse(comment?.updatedAt) ? (
                <Divider orientation="vertical" />
              ) : (
                ""
              )}
              {Date.parse(comment?.createdAt) <
              Date.parse(comment?.updatedAt) ? (
                <Text size={"sm"} color={"cyan.7"}>
                  Updated {DateDiffCalc(comment?.updatedAt as string)}
                </Text>
              ) : (
                ""
              )}
            </Group>
          </Box>
        )
      )}
      <Divider my="sm" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addMutation.mutate({
            postId: post?.postId as string,
            userId: session?.data?.user?.id as string,
            message: message,
            reply: (replying as string) || null,
          });
        }}
      >
        <Text size={"sm"} weight={500}>
          Message
        </Text>
        {replying ? (
          <Box onClick={() => setReplying(null)} sx={replyingHeaderStyle}>
            <Group>
              <ActionIcon pl={10} variant="transparent" size={"md"}>
                <IconX />
              </ActionIcon>
              <Text c="grey" fw={500}>
                Replying to&nbsp;
                {
                  users.find(
                    (user) =>
                      user["id"] ===
                      (comments.find(
                        (comment: { [x: string]: string }) =>
                          comment["commentId"] === replying
                      )["userId"] as string)
                  )?.["value"]
                }
              </Text>
            </Group>
          </Box>
        ) : (
          ""
        )}
        {edit ? (
          ""
        ) : (
          <>
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
          </>
        )}
      </form>
    </Box>
  );
};

export default ForumPost;

const replyBoxStyles = (theme: MantineTheme): CSSObject => ({
  backgroundColor:
    theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2],
  borderRadius: 3,
  borderStyle: "solid",
  borderWidth: 1,
  borderColor:
    theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[4],
  maxWidth: "30vw",
  cursor: "pointer",

  "@keyframes ": {},

  "&:hover": {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3],
  },
});

const replyingHeaderStyle = (theme: MantineTheme): CSSObject => ({
  backgroundColor:
    theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[3],
  textAlign: "center",
  paddingTop: 6,
  paddingBottom: 3,
  borderTopRightRadius: theme.radius.md,
  borderTopLeftRadius: theme.radius.md,
  borderBottom: 0,
  cursor: "pointer",

  "&:hover": {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[4],
  },
});
