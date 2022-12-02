import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { PostMedia, Comment, CommentMedia } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useState } from "react";
import modules from "../editor/Modules";
import dynamic from "next/dynamic";
const QuillNoSSRWrapper = dynamic(() => import("react-quill"), { ssr: false });

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

const ForumPost = ({
  post,
  setRedirect,
}: {
  post: postType;
  setRedirect: Dispatch<SetStateAction<boolean>>;
}) => {
  const [value, setValue] = useState("");

  const session = useSession();
  const queryClient = useQueryClient();

  console.log(post?.postId);

  // onChange expects a function with these 4 arguments
  function handleChange(content: any, delta: any, source: any, editor: any) {
    setValue(editor.getContents());
    form.values.message = value;
  }

  const {
    data: comments,
    isLoading,
    isFetching,
    isError,
  } = useQuery(["post-comments"], async () => {
    const res = await axios.post(
      "http://localhost:3000/api/forum/getAllComments",
      { postId: post?.postId }
    );
    return res.data;
  });

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
      queryClient.invalidateQueries(["post-comments"]);
      form.values.message = "";
    },
  });

  function handleBack() {
    setRedirect(false);
  }

  const form = useForm({
    initialValues: {
      message: "",
    },
    validate: {
      message: (value) => value.trim().length === 0,
    },
  });

  if (isLoading || isFetching || !comments)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isError) return <div>Something went wrong!</div>;

  return (
    <>
      <a onClick={handleBack}>Back</a>
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
      <div>
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
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({
            postId: post?.postId as string,
            userId: session?.data?.user?.id as string,
            message: form.values.message,
          });
        }}
      >
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
          <QuillNoSSRWrapper
            modules={modules}
            onChange={handleChange}
            // {...form.getInputProps("message")}
            theme="snow"
          />
        </SimpleGrid>
        <Group position="center" mt="xl">
          <Button type="submit" size="md">
            Send message
          </Button>
        </Group>
      </form>
    </>
  );
};

export default ForumPost;
