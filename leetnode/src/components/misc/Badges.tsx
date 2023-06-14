import { Badge } from "@mantine/core";
import {
  CourseType,
  Level,
  PostType,
  QuestionDifficulty,
  Role,
} from "@prisma/client";
import { IconLock, IconShieldLock } from "@tabler/icons";

export function RoleBadge({ role, ...props }: { role: Role | undefined }) {
  if (!role) throw new Error("RoleBadge: role is undefined");
  return (
    <Badge
      color={
        role === Role.SUPERUSER ? "red" : role === Role.ADMIN ? "orange" : ""
      }
      leftSection={
        (role === Role.SUPERUSER && (
          <IconShieldLock size={12} style={{ marginLeft: 4 }} strokeWidth={2} />
        )) ||
        (role === Role.ADMIN && (
          <IconLock size={12} style={{ marginLeft: 4 }} strokeWidth={2} />
        ))
      }
      {...props}
    >
      {role}
    </Badge>
  );
}

export function QuestionDifficultyBadge({
  questionDifficulty,
  ...props
}: {
  questionDifficulty: QuestionDifficulty;
}) {
  return (
    <Badge
      color={
        questionDifficulty === QuestionDifficulty.Easy
          ? "green"
          : questionDifficulty === QuestionDifficulty.Medium
          ? "yellow"
          : "red"
      }
      {...props}
    >
      {questionDifficulty} Difficulty
    </Badge>
  );
}

export function PostTypeBadge({
  postType,
  ...props
}: {
  postType: PostType | undefined;
}) {
  return (
    <Badge
      color={
        postType === PostType.Content
          ? "grape"
          : postType === PostType.Quiz
          ? "blue"
          : "gray"
      }
      variant="light"
      {...props}
    >
      {postType}
    </Badge>
  );
}

export function CourseTypeBadge({
  course,
  ...props
}: {
  course: {
    courseName: string;
    courseLevel: Level;
    type: CourseType;
  };
}) {
  return (
    <Badge
      color={
        course.type === CourseType.Content
          ? course.courseLevel === Level.Foundational
            ? "green"
            : course.courseLevel === Level.Intermediate
            ? "yellow"
            : "red"
          : ""
      }
      {...props}
    >
      {course.courseName}
    </Badge>
  );
}
