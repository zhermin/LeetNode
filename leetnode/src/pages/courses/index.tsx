import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dots from "@/components/Dots";

import { Carousel } from "@mantine/carousel";
import {
  createStyles,
  Text,
  Title,
  Button,
  Container,
  Box,
  Card,
  Group,
  Badge,
  Center,
  Loader,
} from "@mantine/core";

import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { Course, CourseType, Level } from "@prisma/client";
import axios from "axios";
import {
  dehydrate,
  QueryCache,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

type allCoursesType = (Course & {
  topics: {
    topicSlug: string;
  }[];
})[];

const fetchCourses: () => Promise<allCoursesType | null> = async () =>
  await axios
    .get("/api/courses")
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      if (err.response?.status === 401) {
        signIn("google");
      }
    });

export interface BadgeCardProps {
  slug: string;
  image: string;
  title: string;
  category: string;
  description: string;
  badges: string[];
  type: CourseType;
}

export function BadgeCard({
  slug,
  image,
  title,
  description,
  category,
  badges,
  type,
}: BadgeCardProps) {
  const { classes, theme } = useStyles();

  const features = badges.map((badge) => (
    <Badge
      color={theme.colorScheme === "dark" ? "dark" : "gray"}
      key={badge}
      leftSection="#"
      size="sm"
    >
      {badge}
    </Badge>
  ));

  return (
    <Link href={`/courses/${slug}`} passHref>
      <Card
        withBorder
        radius="md"
        m="md"
        className={classes.card}
        component="a"
      >
        <Card.Section>
          <Box
            sx={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: 200,
            }}
          >
            <Badge size="sm" className="absolute top-3 right-3">
              {category}
            </Badge>
          </Box>
        </Card.Section>
        <Card.Section className={classes.section} mt="md">
          <Text size="lg" weight={500}>
            {title}
          </Text>
          <Text size="sm" mt="xs">
            {description}
          </Text>
        </Card.Section>
        <Card.Section className={classes.section}>
          <Text mt="md" className={classes.label} color="dimmed">
            Topics
          </Text>
          <Group spacing={7} mt={5}>
            {features}
          </Group>
        </Card.Section>
        <Group mt="xs">
          <Button radius="md" style={{ flex: 1 }}>
            Start {type === CourseType.Content ? "Course" : "Quiz"}
          </Button>
        </Group>
      </Card>
    </Link>
  );
}

export default function CoursesPage() {
  const { classes } = useStyles();

  const {
    data: courses,
    isLoading,
    isFetching,
  } = useQuery<allCoursesType | null>(["all-courses"], fetchCourses);
  console.log(courses);

  console.log(isLoading, isFetching);
  if (isLoading || !courses)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );

  return (
    <>
      <Header title="All Courses" />
      <Navbar />
      <Container size={1400} className={classes.wrapper}>
        <Dots
          dotPositions={[
            { left: 0, top: 0 },
            { left: 120, top: 20 },
            { right: 0, top: 80 },
            { right: 120, top: 0 },
          ]}
        />
        <Box className={classes.innerWrapper}>
          <Title className={classes.title}>All Courses</Title>
        </Box>
      </Container>
      <Container size={1400} className={classes.coursesContainer}>
        <Title className={classes.subtitle}>Quizzes</Title>
        <Carousel
          slideSize="30%"
          breakpoints={[{ maxWidth: "sm", slideSize: "100%", slideGap: 2 }]}
          align="start"
          slideGap="xl"
          controlsOffset={-20}
          controlSize={30}
          styles={{
            control: {
              "&[data-inactive]": {
                opacity: 0,
                cursor: "default",
              },
            },
          }}
        >
          {courses
            .filter((course) => course.type === CourseType.Quiz)
            .map((course) => (
              <Carousel.Slide key={course.courseSlug}>
                <BadgeCard
                  {...{
                    slug: course.courseSlug,
                    image: course.courseImage,
                    title: course.courseName,
                    category: `QUIZ`,
                    description: course.courseDescription,
                    badges: course.topics.map((topic) => topic.topicSlug),
                    type: course.type,
                  }}
                />
              </Carousel.Slide>
            ))}
        </Carousel>
      </Container>
      <Container size={1400} className={classes.coursesContainer}>
        <Title className={classes.subtitle}>Foundational Courses</Title>
        <Carousel
          slideSize="30%"
          breakpoints={[
            { maxWidth: "md", slideSize: "50%", slideGap: 2 },
            { maxWidth: "sm", slideSize: "100%", slideGap: 2 },
          ]}
          align="start"
          slideGap="xl"
          controlsOffset={-20}
          controlSize={30}
          styles={{
            control: {
              "&[data-inactive]": {
                opacity: 0,
                cursor: "default",
              },
            },
          }}
        >
          {courses
            .filter(
              (course) =>
                course.courseLevel === Level.Foundational &&
                course.type === CourseType.Content
            )
            .map((course) => (
              <Carousel.Slide key={course.courseSlug}>
                <BadgeCard
                  {...{
                    slug: course.courseSlug,
                    image: course.courseImage,
                    title: course.courseName,
                    category: `W${course.week}S${course.studio}`,
                    description: course.courseDescription,
                    badges: course.topics.map((topic) => topic.topicSlug),
                    type: course.type,
                  }}
                />
              </Carousel.Slide>
            ))}
        </Carousel>
      </Container>
      <Container size={1400} className={classes.coursesContainer}>
        <Title className={classes.subtitle}>Intermediate Courses</Title>
        <Carousel
          slideSize="30%"
          breakpoints={[{ maxWidth: "sm", slideSize: "100%", slideGap: 2 }]}
          align="start"
          slideGap="xl"
          controlsOffset={-20}
          controlSize={30}
          styles={{
            control: {
              "&[data-inactive]": {
                opacity: 0,
                cursor: "default",
              },
            },
          }}
        >
          {courses
            .filter(
              (course) =>
                course.courseLevel === Level.Intermediate &&
                course.type === CourseType.Content
            )
            .map((course) => (
              <Carousel.Slide key={course.courseSlug}>
                <BadgeCard
                  {...{
                    slug: course.courseSlug,
                    image: course.courseImage,
                    title: course.courseName,
                    category: `W${course.week}S${course.studio}`,
                    description: course.courseDescription,
                    badges: course.topics.map((topic) => topic.topicSlug),
                    type: course.type,
                  }}
                />
              </Carousel.Slide>
            ))}
        </Carousel>
      </Container>
      <Container size={1400} className={classes.coursesContainer}>
        <Title className={classes.subtitle}>Advanced Courses</Title>
        <Carousel
          slideSize="30%"
          breakpoints={[{ maxWidth: "sm", slideSize: "100%", slideGap: 2 }]}
          align="start"
          slideGap="xl"
          controlsOffset={-20}
          controlSize={30}
          styles={{
            control: {
              "&[data-inactive]": {
                opacity: 0,
                cursor: "default",
              },
            },
          }}
        >
          {courses
            .filter(
              (course) =>
                course.courseLevel === Level.Advanced &&
                course.type === CourseType.Content
            )
            .map((course) => (
              <Carousel.Slide key={course.courseSlug}>
                <BadgeCard
                  {...{
                    slug: course.courseSlug,
                    image: course.courseImage,
                    title: course.courseName,
                    category: `W${course.week}S${course.studio}`,
                    description: course.courseDescription,
                    badges: course.topics.map((topic) => topic.topicSlug),
                    type: course.type,
                  }}
                />
              </Carousel.Slide>
            ))}
        </Carousel>
      </Container>
      <Footer />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) signIn("google");

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Something went wrong: ${error.message}`);
        }
      },
    }),
  });
  await queryClient.prefetchQuery<allCoursesType | null>(
    ["all-user-questions"],
    fetchCourses
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 40,
    paddingBottom: 40,
    margin: `${theme.spacing.xl}px auto`,

    "@media (max-width: 755px)": {
      paddingTop: 40,
      paddingBottom: 30,
    },
  },

  innerWrapper: {
    position: "relative",
    zIndex: 1,
  },

  coursesContainer: {
    padding: `${theme.spacing.xl}px`,
    margin: "50px auto",
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: 48,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    padding: `${theme.spacing.md}px`,

    "@media (max-width: 520px)": {
      fontSize: 28,
      textAlign: "left",
    },
  },

  subtitle: {
    textAlign: "left",
    fontWeight: 500,
    fontSize: 40,
    letterSpacing: -2,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[0]
        : theme.colors.gray[9],
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xl,

    "@media (max-width: 520px)": {
      fontSize: 20,
    },
  },

  cardTitle: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    lineHeight: 1.2,
    fontSize: 32,
    marginTop: theme.spacing.xs,
  },

  inner: {
    display: "flex",

    [theme.fn.smallerThan(350)]: {
      flexDirection: "column",
    },
  },

  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "all 300ms ease-in-out",
    filter:
      "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))",

    "&:hover": {
      filter:
        "drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
    },
  },

  section: {
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },

  label: {
    textTransform: "uppercase",
    fontSize: theme.fontSizes.xs,
    fontWeight: 700,
  },
}));
