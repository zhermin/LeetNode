import axios from "axios";
import { signIn } from "next-auth/react";
import { Dispatch, SetStateAction, useState } from "react";
import toast from "react-hot-toast";

import {
  ActionIcon,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconBrandGoogle, IconLogin, IconSpeakerphone } from "@tabler/icons";
import { useMutation } from "@tanstack/react-query";

export default function Login({
  setLoginMenuOpened,
}: {
  setLoginMenuOpened: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useMantineTheme();

  const [email, setEmail] = useState("");
  const [emailLoginIsLoading, setEmailLoginIsLoading] = useState(false);

  const emailSignIn = async (isNewUser?: boolean) => {
    const res = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: isNewUser ? "/welcome" : undefined,
    });
    if (res?.error) {
      toast.error(`${res.error}\n\nPlease contact support if this persists.`);
    } else if (res?.ok) {
      toast.success(
        `Verification successful! Check your inbox and junk mail for the magic link!\n\nVerified:\n${email}`,
        {
          duration: 5000,
        }
      );
      setEmail("");
      setLoginMenuOpened(false);
    }
    setEmailLoginIsLoading(false);
  };

  const { mutate: handleEmailLogin } = useMutation({
    mutationFn: () =>
      axios.post<{
        customToast: boolean;
        emailAllowed: boolean;
        isNewUser?: boolean;
      }>(`/api/auth/isEmailAllowed?email=${email}`),
    onSuccess: (data) => {
      if (!data?.data.emailAllowed) {
        toast.error(
          "Unfortunately you are not authorized to access LeetNode without a valid invite. \n\nIn the meantime, you may join our waitlist or if you think this is a mistake, please contact support."
        );
        setEmailLoginIsLoading(false);
      } else {
        emailSignIn(data?.data.isNewUser);
      }
    },
  });

  const { mutate: handleJoinWaitlist } = useMutation({
    mutationFn: () => axios.post(`/api/auth/joinWaitlist?email=${email}`),
    onSuccess: (data) => {
      if (data?.status === 201) {
        setEmail("");
        setLoginMenuOpened(false);
      }
      setEmailLoginIsLoading(false);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEmailLoginIsLoading(true);
        handleEmailLogin();
      }}
    >
      <LoadingOverlay
        visible={emailLoginIsLoading}
        overlayBlur={1}
        radius="md"
      />
      <Container p="sm">
        <Stack spacing="sm">
          <Title order={3}>
            Welcome to{" "}
            <Text
              component="span"
              variant="gradient"
              gradient={{ from: theme.colors.cyan[5], to: "blue" }}
            >
              LeetNode
            </Text>
            !
          </Title>
          <TextInput
            required
            radius="md"
            name="email"
            type="email"
            placeholder="Invite Email"
            disabled={emailLoginIsLoading}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value.trim())}
            error={email.length > 0 && !/^(.+)@(.+)$/.test(email)}
            styles={{
              input: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[0],
              },
            }}
          />
          <Text size="xs" color="dimmed">
            Enter the email address stated in your invite
          </Text>
          <Group position="apart">
            <Group spacing="xs">
              <Button
                type="submit"
                size="xs"
                variant="outline"
                color="gray"
                radius="xl"
                className="hover:bg-gray-50 dark:hover:bg-gray-900"
                leftIcon={<IconLogin size={18} stroke={1.5} />}
              >
                Get Link
              </Button>
              <ActionIcon
                size="md"
                variant="outline"
                color="gray"
                radius="xl"
                className="hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => signIn("google")}
              >
                <IconBrandGoogle size={18} />
              </ActionIcon>
            </Group>
            <Button
              size="xs"
              variant="light"
              color="gray"
              radius="md"
              className="dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              leftIcon={<IconSpeakerphone size={18} stroke={1.5} />}
              onClick={() => {
                if (email.length === 0 || !/^(.+)@(.+)$/.test(email)) {
                  toast.error("Please enter a valid email address");
                  return;
                }
                setEmailLoginIsLoading(true);
                handleJoinWaitlist();
              }}
            >
              Join Waitlist
            </Button>
          </Group>
        </Stack>
      </Container>
    </form>
  );
}
