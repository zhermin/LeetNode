import { useRouter } from "next/router";

const Question = () => {
  const router = useRouter();
  const { questionId } = router.query;
  return <div>Question ID: {questionId}</div>;
};

export default Question;
