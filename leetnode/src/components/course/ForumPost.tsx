import axios, { AxiosError } from "axios";
import DOMPurify from "dompurify";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
  ActionIcon,
  Avatar,
  Blockquote,
  Box,
  Button,
  createStyles,
  CSSObject,
  Divider,
  Flex,
  Group,
  keyframes,
  MantineTheme,
  NavLink,
  Paper,
  Popover,
  Select,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconCornerDownRight,
  IconDotsVertical,
  IconThumbDown,
  IconThumbUp,
  IconX,
} from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PostTypeBadge } from "../misc/Badges";
import { PostFullType } from "./CourseDiscussion";
import DateDiffCalc from "./DateDiffCalc";

const Editor = dynamic(import("@/components/editor/CustomRichTextEditor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

const ForumPost = ({
  postId,
  setRedirect,
  users,
}: {
  postId: string;
  setRedirect: Dispatch<SetStateAction<boolean>>;
  users: { id: string; image: string; value: string }[];
}) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const { classes } = useStyles();

  const [message, setMessage] = useState("");
  const [sort, setSort] = useState<string | null>("newest");
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
  const { data: posts } = useQuery({
    queryKey: ["all-posts"],
    queryFn: () => axios.get<PostFullType[]>("/api/forum/getAllPosts"),
  });

  const post = posts?.data.find((post) => post?.postId === postId);

  useEffect(() => {
    if (
      post?.postLikes.find((user) => user.userId === session.data?.user?.id)
        ?.likes === 1
    ) {
      setVoted(1);
    } else if (
      post?.postLikes.find((user) => user.userId === session.data?.user?.id)
        ?.likes === -1
    ) {
      setVoted(-1);
    }

    setDisplayLikes(post?.postLikes.reduce((acc, user) => acc + user.likes, 0));
  }, [post, session.data?.user?.id]);

  const addMutation = useMutation<
    Response,
    AxiosError,
    { postId: string; userId: string; message: string; reply: unknown },
    () => void
  >({
    mutationFn: (newComment) => axios.post("/api/forum/addComment", newComment),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
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
    mutationFn: (editComment) =>
      axios.post("/api/forum/editComment", editComment),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
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
    mutationFn: (editPost) => axios.post("/api/forum/editPost", editPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-posts"]);
      setMessage("");
      setReplying(null);
      setEdit(null);
    },
  });

  function handleVote(vote: number) {
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
      await axios.post("/api/forum/changeLikes", data);
    };
  }

  return (
    <>
      <Paper withBorder p="sm">
        <Flex align="center" gap="xl" mb="xl">
          <ActionIcon
            onClick={() => {
              setRedirect(false);
              queryClient.invalidateQueries(["all-posts"]);
            }}
            variant="transparent"
          >
            <IconChevronLeft size={68} />
          </ActionIcon>
          <Title order={2}>{post?.title}</Title>
        </Flex>
        <Group position="apart">
          <Group>
            <Text size="xs" color="dimmed">
              {formatIsoDateTime(post?.createdAt.toString() as string)}
            </Text>
            <PostTypeBadge postType={post?.postType} />
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
              <ActionIcon size="sm">
                <IconDotsVertical onClick={() => setPostOpened((o) => !o)} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown p={0}>
              <NavLink
                label="Edit"
                onClick={() => {
                  setEdit(post?.postId as string);
                  setMessage(post?.message as string);
                  setPostOpened(false);
                }}
                disabled={session?.data?.user?.id !== post?.userId}
              />
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
            <Editor
              upload_preset="forum_media"
              value={message}
              onChange={setMessage}
            />
            <Group position="center" mt="xl">
              <Button type="submit">Edit message</Button>
              <Button
                onClick={() => {
                  setEdit(null);
                  setMessage("");
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
                __html: DOMPurify.sanitize(`${post?.message}`, {
                  ADD_TAGS: ["iframe"],
                  ADD_ATTR: [
                    "allow",
                    "allowfullscreen",
                    "frameborder",
                    "scrolling",
                  ],
                }),
              }}
            />
          </TypographyStylesProvider>
        )}
        <Group position="apart" mt="4vw">
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
            {post?.createdAt !== post?.updatedAt && (
              <>
                <Divider orientation="vertical" />
                <Text size="sm" color="dimmed">
                  Updated {DateDiffCalc(post?.updatedAt as Date)}
                </Text>
              </>
            )}
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
      </Paper>

      <Box px="sm">
        <Group position="apart" mt="xl">
          <Title size="sm">Comments</Title>
          <Group>
            <Text>Sort by: </Text>
            <Select
              value={sort}
              data={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ]}
              onChange={(value) => {
                setSort(value);
                post?.comment.reverse();
              }}
            />
          </Group>
        </Group>
        {post?.comment
          .map((comment) => (
            <Box key={comment.commentId} id={comment.commentId} mt={4}>
              <Divider my="sm" />
              <Group position="apart">
                <Group mb="md">
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
                  <Title size="sm" fw={500}>
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
                    <ActionIcon size="sm">
                      <IconDotsVertical
                        onClick={() => {
                          setCommentOpened((o) => !o);
                          setCommentEdit(comment.commentId);
                        }}
                      />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown p={0}>
                    <NavLink
                      label="Edit"
                      onClick={() => {
                        setEdit(comment?.commentId);
                        setMessage(comment.message);
                        setCommentOpened(false);
                      }}
                      disabled={comment?.userId !== session?.data?.user?.id}
                    />
                    <NavLink
                      label="Reply"
                      onClick={() => {
                        setReplying(comment?.commentId);
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
                  <Editor
                    upload_preset="forum_media"
                    value={message}
                    onChange={setMessage}
                  />
                  <Group position="center" mt="xl">
                    <Button type="submit">Edit message</Button>
                    <Button
                      onClick={() => {
                        setEdit(null);
                        setMessage("");
                      }}
                    >
                      Cancel
                    </Button>
                  </Group>
                </form>
              ) : comment.reply !== null ? (
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
                      document
                        .getElementById(comment.reply as string)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    <Text
                      ml="xl"
                      mt="md"
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
                            post?.comment?.find(
                              (e: {
                                commentId: string;
                                reply: string | null;
                              }) => e.commentId === comment.reply
                            )?.userId
                        )?.value
                      }
                    </Text>
                    <Blockquote
                      // TODO: Reply seems to be broken
                      icon={<IconCornerDownRight size="lg" />}
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
                          dangerouslySetInnerHTML={
                            comment
                              ? {
                                  __html: DOMPurify.sanitize(
                                    `${
                                      post?.comment.find(
                                        (e: {
                                          commentId: string;
                                          reply: string | null;
                                        }) => e.commentId === comment.reply
                                      )?.message
                                    }`,
                                    {
                                      ADD_TAGS: ["iframe"],
                                      ADD_ATTR: [
                                        "allow",
                                        "allowfullscreen",
                                        "frameborder",
                                        "scrolling",
                                      ],
                                    }
                                  ),
                                }
                              : undefined
                          }
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
                          __html: DOMPurify.sanitize(comment.message, {
                            ADD_TAGS: ["iframe"],
                            ADD_ATTR: [
                              "allow",
                              "allowfullscreen",
                              "frameborder",
                              "scrolling",
                            ],
                          }),
                        }}
                      />
                    </TypographyStylesProvider>
                  </Text>
                </Box>
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
                        __html: DOMPurify.sanitize(comment.message, {
                          ADD_TAGS: ["iframe"],
                          ADD_ATTR: [
                            "allow",
                            "allowfullscreen",
                            "frameborder",
                            "scrolling",
                          ],
                        }),
                      }}
                    />
                  </TypographyStylesProvider>
                </Text>
              )}
              <Group mt="md">
                <Text size="xs" color="dimmed">
                  {formatIsoDateTime(comment?.createdAt.toString() as string)}
                </Text>
                {comment?.createdAt < comment?.updatedAt && (
                  <Divider orientation="vertical" />
                )}
                {comment?.createdAt < comment?.updatedAt && (
                  <Text size="sm" color="dimmed">
                    Updated {DateDiffCalc(comment?.updatedAt as Date)}
                  </Text>
                )}
              </Group>
            </Box>
          ))
          .reverse()}
        <Divider mt="sm" mb="xl" />
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
          <Title size="sm" mt="xl" mb="sm">
            New Comment
          </Title>
          {replying && (
            <Box onClick={() => setReplying(null)} sx={replyingHeaderStyle}>
              <Group>
                <ActionIcon pl={10} variant="transparent" size="md">
                  <IconX />
                </ActionIcon>
                <Text c="grey" fw={500}>
                  Replying to{" "}
                  {
                    users.find(
                      (user) =>
                        user["id"] ===
                        (post?.comment.find(
                          (comment) => comment["commentId"] === replying
                        )?.["userId"] as string)
                    )?.["value"]
                  }
                </Text>
              </Group>
            </Box>
          )}
          {!edit && (
            <>
              <Editor
                upload_preset="forum_media"
                value={message}
                onChange={setMessage}
              />
              <Group position="center" mt="xl">
                <Button fullWidth type="submit" size="md">
                  Upload Comment
                </Button>
              </Group>
            </>
          )}
        </form>
      </Box>
    </>
  );
};

export default ForumPost;

const flash = keyframes({
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
  paddingBottom: 9,
  marginBottom: -3,
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
