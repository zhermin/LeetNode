import { useState } from "react";

import {
  Button,
  Card,
  Center,
  Container,
  createStyles,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { Course, Topic, UserCourseQuestion } from "@prisma/client";
import {
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
} from "@tabler/icons";

type CourseInfoType = Course & { topic: Topic } & {
  userCourseQuestion: UserCourseQuestion;
};

interface CoursesProps {
  courses: CourseInfoType[];
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 34,
    fontWeight: 900,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24,
    },
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  card: {
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
    },
  },
  action: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
  },
}));

const Courses = ({ courses }: CoursesProps) => {
  const { classes } = useStyles();

  const [sort, setSort] = useState("All Courses");
  const [opened, setOpened] = useState(false);
  const [details, setDetails] = useState<CourseInfoType | null>();

  let filteredCourses;
  {
    sort === "All Courses"
      ? (filteredCourses = courses)
      : (filteredCourses = courses.filter((c) => c.courseLevel === sort));
  }
  console.log(courses);
  console.log(filteredCourses);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={details?.courseName}
      >
        test
      </Modal>
      <Container size="lg" py="xl">
        <Title
          order={2}
          className={classes.title}
          align="center"
          mt="md"
          mb="lg"
        >
          Courses Detailed Statistics
        </Title>

        {/* <Text
      color="dimmed"
      className={classes.description}
      align="center"
      mt="md"
      mb="lg"
    >
      Every once in a while, you’ll see a Golbat that’s missing some fangs.
      This happens when hunger drives it to try biting a Steel-type Pokémon.
    </Text> */}
        <Center>
          <SegmentedControl
            sx={(theme) => ({
              root: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.white,
                boxShadow: theme.shadows.md,
                border: `1px solid ${
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : theme.colors.gray[1]
                }`,
              },

              active: {
                backgroundImage: theme.fn.gradient({
                  from: "pink",
                  to: "orange",
                }),
              },

              control: {
                border: "0 !important",
              },

              labelActive: {
                color: `${theme.white} !important`,
              },
            })}
            size="md"
            radius="xl"
            data={[
              { value: "All Courses", label: "All Courses" },
              {
                value: "Foundational",
                label: "Foundational",
              },
              {
                value: "Intermediate",
                label: "Intermediate",
              },
              {
                value: "Advanced",
                label: "Advanced",
              },
            ]}
            value={sort}
            onChange={setSort}
          />
        </Center>
        <SimpleGrid
          cols={3}
          spacing="xl"
          mt={30}
          breakpoints={[{ maxWidth: "md", cols: 1 }]}
        >
          {filteredCourses.map((c) => (
            <Card
              key={c.courseSlug}
              shadow="md"
              radius="md"
              className={classes.card}
              p="xl"
            >
              {c.courseLevel === "Advanced" ? (
                <IconSquareNumber3 color="red" />
              ) : c.courseLevel === "Foundational" ? (
                <IconSquareNumber1 color="green" />
              ) : (
                <IconSquareNumber2 color="orange" />
              )}
              {/* <feature.icon size={50} stroke={2} color={theme.fn.primaryColor()} /> */}
              <Text
                size="lg"
                weight={500}
                className={classes.cardTitle}
                mt="md"
              >
                {c.courseName}
              </Text>
              <Text size="sm" color="dimmed" mt="sm" mb={70}>
                {c.courseDescription}
              </Text>
              <Button
                radius="xl"
                style={{ flex: 1 }}
                className={classes.action}
                onClick={() => {
                  setOpened(true);
                  setDetails(c);
                }}
              >
                Details
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
};

export default Courses;
