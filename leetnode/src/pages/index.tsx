import Image from "next/image";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Dots from "@/components/misc/Dots";
import Navbar from "@/components/Navbar";
import {
  Box,
  Button,
  Container,
  createStyles,
  Grid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export default function HomePage() {
  const { classes, theme } = useStyles();

  return (
    <>
      <Header />
      <Container>
        <Navbar withBorder={false} />
      </Container>
      <Container className={classes.wrapper} size={1400} px="xl">
        <Dots
          dotPositions={[
            { left: 20, top: -60 },
            { left: 200, top: -60 },
            { left: -20, top: 20 },
            { left: 100, top: 0 },
            { left: 60, top: 100 },
            { right: 20, top: 60 },
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
            <Button
              className={classes.control}
              size="lg"
              component="a"
              href="/courses"
            >
              Start Your Journey
            </Button>
          </Box>
        </Box>
      </Container>
      <Container size={1000} p="xl" mb={100}>
        <Grid grow>
          <Grid.Col sm={3} pb="lg" className={classes.image}>
            <Image
              src="/bkt-diagram.png"
              alt="Bayesian Knowledge Tracing Diagram"
              width="0"
              height="0"
              sizes="100vw"
              className="h-auto w-full"
            />
          </Grid.Col>
          <Grid.Col sm={1}>
            <Stack justify="flex-start">
              <Title order={3}>The Recommendation Engine</Title>
              <Text size="md" align="left" color="dimmed">
                LeetNode leverages the Machine Learning algorithm known as{" "}
                <em>Bayesian Knowledge Tracing (BKT)</em> to provide a
                personalized learning experience.
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

const useStyles = createStyles((theme) => ({
  image: {
    filter: theme.colorScheme === "dark" ? "invert(1)" : "none",
  },

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
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).background
        : theme.fn.variant({
            variant: "filled",
            color: theme.primaryColor,
          }).background,
    color:
      theme.colorScheme === "dark"
        ? theme.fn.variant({ variant: "light", color: theme.primaryColor })
            .color
        : theme.fn.variant({ variant: "filled", color: theme.primaryColor })
            .color,
  },
}));
