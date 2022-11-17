import { PostMedia, Comment } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

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
  function handleBack() {
    setRedirect(false);
  }

  return (
    <>
      <div>{post?.postId}</div>
      <div>{post?.title}</div>
      <div>{post?.userId}</div>
      <div>{post?.postType}</div>
      <div>{post?.message}</div>
      <div>{post?.createdAt}</div>
      <div>{post?.updatedAt}</div>
      <div>{post?.postMedia?.[0]?.postMediaURL}</div>
      {post?.comment?.map((e) => (
        <div key={e.commentId}>{e.message}</div>
      ))}
      <a onClick={handleBack}>Back</a>
    </>
  );
};

export default ForumPost;
