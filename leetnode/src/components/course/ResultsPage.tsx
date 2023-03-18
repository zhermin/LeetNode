import axios from "axios";
import { useSession } from "next-auth/react";

import ProgressBar from "@/components/course/ProgressBar";
import { CourseInfoType } from "@/pages/courses/[courseSlug]";
import { Center, Loader, Paper, Text, Title } from "@mantine/core";
import { Attempt, Question, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

type AttemptsInterface = Attempt & {
  user: User;
  question: Question;
  answer: Question;
};

const ShowResults = ({
  course,
}: {
  course: CourseInfoType;
}) => {
  const session = useSession();

  const { data: attempts } = useQuery<AttemptsInterface[]>(
    ["all-attempts"],
    async () => {
      try {
        const { data } = await axios.get(`/api/prof/getAllAttempts`);
        return data;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to refetch all attempts from API");
      }
    },
    { useErrorBoundary: true }
  );

  if (!attempts) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  // return <Text>test</Text>;
  const arrScore = attempts.filter(
    (user) => user.userId === session?.data?.user?.id && user.isCorrect
  );
  const score = arrScore.length;
  
  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={1} mt="md" align="center">
        Score: {score}/{attempts.length}
      </Title>
      <Text size="xl" mb="xl" align="center">
        Keep practicing to achieve mastery in all topics!
      </Text>
      {course?.topics?.map((eachProgress) => (
        <ProgressBar
          topicSlug={eachProgress.topicSlug as string}
          topicName={eachProgress.topicName as string}
          key={eachProgress.topicSlug}
        />
      ))}
    </Paper>
  );
};

export default ShowResults;
