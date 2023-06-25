import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";

import Footer from "@/components/Footer";
import Consent from "@/components/forms/Consent";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import {
  Button,
  Center,
  Divider,
  Flex,
  Loader,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function ConsentPage() {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ["user-consent"],
    queryFn: () =>
      axios.get<{
        name?: string;
        nusnetId?: string;
        consentDate?: Date;
        isNewUser: boolean;
      }>("/api/init"),
  });

  const { mutate: getUserConsent, isLoading: mutationIsLoading } = useMutation({
    mutationFn: ({ name, nusnetId }: { name?: string; nusnetId?: string }) =>
      axios.post("/api/init", { name, nusnetId }),
    onSuccess: () => {
      router.push("/courses");
    },
  });

  const [fullname, setFullname] = useState("");
  const [nusnetId, setNusnetId] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = user?.data.name ?? fullname.trim();
    if (name.length < 4 || nusnetId.trim().length !== 9) {
      toast.error(
        "Please enter your fullname and NUSNET ID if you wish to consent to the study."
      );
      return;
    }
    getUserConsent({ name, nusnetId });
  };

  if (!user) {
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
      <form onSubmit={handleSubmit}>
        <Stack
          align="center"
          justify="center"
          px="sm"
          h="calc(100vh - 150px)"
          bg={
            theme.colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[0]
          }
        >
          <Title align="center" order={2} fw={700}>
            {user?.data.isNewUser
              ? "Welcome to LeetNode!"
              : "NUS Data Consent Form"}
          </Title>
          <Text
            mx="auto"
            color="dimmed"
            align="center"
            w={mobile ? "90%" : "60%"}
            size={mobile ? "xs" : "md"}
          >
            Please read the following consent request and enter your student
            details if you agree. You may also choose to remain anonymous and
            continue using LeetNode.
          </Text>
          <Paper
            withBorder
            shadow="md"
            mt="sm"
            radius="md"
            w={mobile ? "90%" : "70%"}
            className="relative"
          >
            <LoadingOverlay visible={mutationIsLoading} overlayBlur={1} />
            <ScrollArea
              py="md"
              px="xl"
              h="calc(100vh - 320px)"
              className="text-justify"
            >
              <Consent />
              <Divider my="xl" variant="dotted" />
              <Text fw={500} mb="md">
                Please type the following information in full:
              </Text>
              <TextInput
                mt="xs"
                label="Full Name"
                placeholder="Alice Tan"
                type="text"
                disabled={user?.data.consentDate !== null}
                value={user?.data.name ?? fullname}
                onChange={(e) => setFullname(e.target.value)}
                error={
                  fullname.trim().length > 0 &&
                  fullname.trim().length < 4 &&
                  "Please enter your name as per NRIC"
                }
              />
              <TextInput
                mt="xs"
                label="Student Number"
                placeholder="A0123456Z"
                type="text"
                disabled={user?.data.consentDate !== null}
                value={user?.data.nusnetId ?? nusnetId}
                onChange={(e) => setNusnetId(e.target.value.toUpperCase())}
                error={
                  nusnetId.trim().length > 0 &&
                  nusnetId.trim().length !== 9 &&
                  "Invalid NUSNET ID"
                }
              />
              <DatePicker
                mt="xs"
                label="Date of Consent"
                value={new Date(user?.data.consentDate ?? Date.now())}
                disabled
              />
              {!user?.data.consentDate && (
                <Flex
                  align="center"
                  gap="sm"
                  mt="xl"
                  direction={mobile ? "column" : "row"}
                >
                  <Button
                    fullWidth
                    color="green"
                    type="submit"
                    loading={mutationIsLoading}
                  >
                    {mutationIsLoading ? "Submitting..." : "Submit and Consent"}
                  </Button>
                  <Button
                    fullWidth
                    color="red"
                    loading={mutationIsLoading}
                    onClick={() => {
                      getUserConsent({});
                      router.push("/courses");
                    }}
                  >
                    I wish to remain anonymous
                  </Button>
                </Flex>
              )}
            </ScrollArea>
          </Paper>
        </Stack>
      </form>
      <Footer />
    </>
  );
}
