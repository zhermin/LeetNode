import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import {
  Button,
  Center,
  Container,
  createStyles,
  Loader,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function WelcomePage() {
  const { classes } = useStyles();

  const router = useRouter();
  const session = useSession();
  if (!session) signIn("google");

  // States to avoid flash before redirect and to push only once
  const [loaded, setLoaded] = useState(false);
  const [calledPush, setCalledPush] = useState(false);

  // If user is already initialized, redirect to courses page
  const { data: getNusnetId } = useQuery<{ nusnetId: string }>({
    queryKey: ["is-user-initialized"],
    queryFn: () => axios.get("/api/init"),
  });

  useEffect(() => {
    if (getNusnetId?.nusnetId != null) {
      // If user already initialized, redirect only once to courses
      // https://stackoverflow.com/a/73344411/10928890
      let calledPushLatest;
      setCalledPush((latest) => {
        calledPushLatest = latest;
        return latest;
      });
      if (calledPushLatest || calledPush) return;
      setCalledPush(true);

      router.push("/courses");
    } else if (getNusnetId !== undefined) {
      // If user not initialized, load the page after data is fetched
      // https://stackoverflow.com/a/58182678/10928890
      setLoaded(true);
    }
  }, [router, getNusnetId, calledPush]);

  // Else, initialize user with form submission
  const { mutate, isLoading: mutationIsLoading } = useMutation({
    mutationFn: (nusnetId: string) => axios.post("/api/init", { nusnetId }),
    onSuccess: () => {
      setLoaded(false);
      router.push("/courses");
    },
  });

  const [nusnetId, setNusnetId] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(nusnetId);
  };

  if (!loaded || mutationIsLoading) {
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Navbar />
      <Center className={classes.mainWrapper}>
        <Container>
          <form onSubmit={handleSubmit}>
            <Title
              align="center"
              sx={(theme) => ({
                fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                fontWeight: 800,
              })}
            >
              Welcome to LeetNode!
            </Title>
            <Text color="dimmed" size="md" align="center" mt={5}>
              To complete your registration, please enter your NUSNET ID
            </Text>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <TextInput
                label="NUSNET ID"
                placeholder="A0123456Z"
                value={nusnetId}
                required
                onChange={(e) => setNusnetId(e.target.value.toUpperCase())}
                error={
                  nusnetId.trim().length > 0 &&
                  nusnetId.trim().length !== 9 &&
                  "Invalid NUSNET ID"
                }
              />
              <Button
                fullWidth
                mt="xl"
                type="submit"
                className={classes.control}
              >
                Submit
              </Button>
            </Paper>
          </form>
        </Container>
      </Center>
      <Footer />
    </>
  );
}

const useStyles = createStyles((theme) => ({
  mainWrapper: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    height: "calc(100vh - 150px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  control: {
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
