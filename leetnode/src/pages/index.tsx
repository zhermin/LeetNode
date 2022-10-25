import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dots from "@/components/Dots";

import Link from "next/link";
import {
  createStyles,
  Title,
  Text,
  Button,
  Box,
  Container,
  Grid,
  Stack,
} from "@mantine/core";
import Image from "next/future/image";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 80,
    paddingBottom: 80,

    "@media (max-width: 755px)": {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  dots: {
    position: "absolute",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],

    "@media (max-width: 568px)": {
      display: "none",
    },
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: 48,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    "@media (max-width: 520px)": {
      fontSize: 28,
      textAlign: "left",
    },
  },

  description: {
    textAlign: "center",

    "@media (max-width: 520px)": {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    "@media (max-width: 520px)": {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    "@media (max-width: 520px)": {
      height: 42,
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },
}));

export default function Home() {
  const { classes, theme } = useStyles();

  return (
    <>
      <Header />
      <Navbar />
      <Container className={classes.wrapper} size={1400}>
        <Dots
          dotPositions={[
            { left: 0, top: 0 },
            { left: 60, top: 0 },
            { left: 0, top: 140 },
            { right: 0, top: 60 },
            { right: 60, top: 200 },
          ]}
        />
        <Box className={classes.inner}>
          <Title className={classes.title}>
            AI-Powered{" "}
            <Text
              component="span"
              variant="gradient"
              gradient={{ from: theme.colors.cyan[5], to: "blue" }}
              inherit
            >
              Mastery Estimation
            </Text>
          </Title>
          <Container p={0} size={650}>
            <Text
              size="lg"
              color="dimmed"
              className={classes.description}
              my="lg"
            >
              Experience a cohesive learning and practice platform that goes
              beyond the traditional &quot;one-size-fits-all&quot; approach to
              education. Tackle questions tailored to your skill level to
              achieve mastery in the core concepts of Engineering.
            </Text>
          </Container>
          <Box className={classes.controls} mt="xl">
            <Link href="/courses" passHref>
              <Button component="a" className={classes.control} size="lg">
                Start Your Journey
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
      <Container size={1000} pt="xl">
        <Grid grow gutter="xl">
          <Grid.Col sm={3} pb="lg">
            <Image
              src="/bkt-diagram.png"
              alt="Bayesian Knowledge Tracing Diagram"
              width="0"
              height="0"
              sizes="100vw"
              className="h-auto w-full"
            />
          </Grid.Col>
          <Grid.Col sm={1} ml="xl">
            <Stack justify="flex-start">
              <Title order={3}>The Recommendation Engine</Title>
              <Text size="md" align="left" color="dimmed">
                LeetNode leverages the Machine Learning algorithm known as
                Bayesian Knowledge Tracing (BKT) to provide a personalized
                learning experience.
              </Text>
              <Text size="md" align="left" color="dimmed">
                BKT is a probabilistic model that estimates a student&apos;s
                mastery of a concept based on their performance on a series of
                questions. Our model is trained on simulated student
                interactions based on historical quiz distribution statistics
                for selected topics.
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
