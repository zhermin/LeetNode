import axios from "axios";
import { useRouter } from "next/router";

import { CourseInfoType } from "@/pages/courses/[courseSlug]";
import { CustomMath } from "@/utils/CustomMath";
import {
  Box,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";

export default function ShowResults() {
  const router = useRouter();
  const [{ data: mastery }, { data: course }] = useQueries({
    queries: [
      {
        queryKey: ["all-mastery"],
        queryFn: () => axios.get<Record<string, number>>("/api/mastery"),
      },
      {
        queryKey: ["course", router.query.courseSlug],
        queryFn: () =>
          axios.get<CourseInfoType>(`/api/courses/${router.query.courseSlug}`),
      },
    ],
  });

  if (!course) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  return (
    <Paper p="xl" radius="md" withBorder>
      {course.data?.topics.map((topic) =>
        !mastery ? (
          <Box py="xs" key={topic.topicSlug}>
            <Group position="apart">
              <Skeleton height={24} width={300} />
              <Skeleton height={26} width={50} />
            </Group>
            <Skeleton mt="md" radius="xl" height={12} width="100%" />
          </Box>
        ) : (
          <Box py="xs" key={topic.topicSlug}>
            <Group position="apart">
              <Text>{topic.topicName}</Text>
              <Title order={4}>
                {CustomMath.round(
                  (mastery.data[topic.topicSlug] ?? 0) * 100,
                  1
                )}
                %
              </Title>
            </Group>
            <Progress
              mt="md"
              color="cyan"
              radius="xl"
              size="lg"
              value={CustomMath.round(
                (mastery.data[topic.topicSlug] ?? 0) * 100,
                1
              )}
              striped
              animate
            />
          </Box>
        )
      )}
    </Paper>
  );
}
