import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import {
  Avatar,
  Button,
  Center,
  createStyles,
  FileInput,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AccountProps {
  userInfo: User;
}

export default function Account({ userInfo }: AccountProps) {
  const session = useSession();
  const { classes } = useStyles();

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const form = useForm({
    initialValues: {
      userName: userInfo.username,
      userNusnetId: userInfo.nusnetId ?? "",
      file: null,
    },
    validateInputOnBlur: true,
    validate: zodResolver(
      z.object({
        userName: z
          .string()
          .trim()
          .regex(/^([\w.@]+)$/, "No special characters allowed")
          .min(5, "Minimum 5 characters")
          .max(30, "Maximum 30 characters")
          .or(z.literal(null))
          .or(z.literal("")),
        userNusnetId: z
          .string()
          .trim()
          .regex(/^[A-Za-z]{1}[0-9]{7}[A-Za-z]{1}$/, "Invalid NUSNET ID")
          .or(z.literal(null))
          .or(z.literal("")),
        file: z
          .instanceof(File)
          .refine((file) => file.size <= 5_000_000, `Max file size is 5MB`)
          .refine(
            (file) => allowedTypes.includes(file.type),
            "Only .png, .jpg, .jpeg, and .webp files are accepted."
          )
          .or(z.literal(null)),
      })
    ),
  });

  const queryClient = useQueryClient();
  const { mutate: updateUser, isLoading: updateUserLoading } = useMutation(
    async () => {
      let imageResponse;
      if (form.values.file) {
        // Generate Signature for Cloudinary Signed Upload
        const timestamp = Math.round(new Date().getTime() / 1000);
        const res = await axios.post("/api/signature", {
          id: session?.data?.user?.id,
          timestamp: timestamp,
        });

        const [signature, key] = [res.data.signature, res.data.key];

        // TODO: Abstract all of these media upload logic into a separate file
        const formData = new FormData();
        formData.append("file", form.values.file);
        formData.append("api_key", key);
        formData.append("eager", "b_rgb:9B9B9B,c_pad,h_150,w_150");
        formData.append("folder", "LeetNode/profile_media");
        formData.append("public_id", session?.data?.user?.id as string);
        formData.append("timestamp", `${timestamp}`);
        formData.append("signature", signature);
        imageResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload/",
          formData
        );
      }

      return await axios.post("/api/user/update", {
        id: session?.data?.user?.id,
        nusnetId:
          form.values.userNusnetId.trim() === ""
            ? null
            : form.values.userNusnetId,
        username:
          form.values.userName.trim() === "" ? null : form.values.userName,
        image: imageResponse?.data?.eager?.[0]?.secure_url ?? userInfo.image,
      });
    },
    {
      onSuccess: (res) => {
        queryClient.setQueryData(["userInfo", session?.data?.user?.id], {
          ...userInfo,
          nusnetId: res.data.nusnetId,
          username: res.data.username,
          image: res.data.image,
        });
      },
    }
  );

  return (
    <>
      <h1 className="text-center">My Profile</h1>
      <hr className="my-4 h-px border-0 bg-gray-200" />
      <form
        onSubmit={form.onSubmit(
          () => {
            updateUser();
          },
          (errors: typeof form.errors) => {
            Object.keys(errors).forEach((key) => {
              toast.error(errors[key] as string);
            });
          }
        )}
      >
        <Center className="mt-3">
          <Avatar
            size={90}
            src={userInfo?.image}
            radius={100}
            className="mb-3"
          />
        </Center>
        <FileInput
          placeholder="Browse image"
          label="Change profile picture"
          description="* PNG / JPG / JPEG / WEBP"
          name="image"
          accept={allowedTypes.join(",")}
          {...form.getInputProps("file")}
        />
        <TextInput
          className="mt-4"
          label="Username (Visible to everyone)"
          placeholder="Please select a username"
          name="name"
          variant="filled"
          {...form.getInputProps("userName")}
        />
        <TextInput
          className="mt-4"
          label="NUSNET ID"
          placeholder="Please enter your NUSNET ID if you are an NUS student"
          name="nusnetId"
          variant="filled"
          value={form.values.userNusnetId}
          onChange={(e) => {
            form.setFieldValue("userNusnetId", e.target.value.toUpperCase());
          }}
          error={form.errors.userNusnetId}
        />
        <Group position="center" mt="xl">
          <Button type="submit" size="md" loading={updateUserLoading}>
            Confirm
          </Button>
          <Button
            variant="white"
            type="button"
            size="md"
            onClick={form.reset}
            className={classes.cancel}
          >
            Reset
          </Button>
        </Group>
      </form>
    </>
  );
}

const useStyles = createStyles((theme) => ({
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
  cancel: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.variant({
            variant: "light",
          }).background
        : theme.fn.variant({
            variant: "white",
          }).background,
    color:
      theme.colorScheme === "dark"
        ? theme.fn.variant({ variant: "light" }).color
        : theme.fn.variant({ variant: "white" }).color,
  },
}));
