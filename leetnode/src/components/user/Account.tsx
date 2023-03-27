import axios from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";

import {
  Avatar,
  Button,
  Center,
  createStyles,
  FileInput,
  Group,
  TextInput,
} from "@mantine/core";
import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AccountProps {
  userInfo: User;
}

export default function Account({ userInfo }: AccountProps) {
  const session = useSession();
  const { classes } = useStyles();

  const [userName, setUserName] = useState(
    userInfo.nickname ?? userInfo.name ?? ""
  );
  const [userNusnetId, setUserNusnetId] = useState(userInfo.nusnetId ?? "");

  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  // Update the user in the DB
  const { mutate: updateUser, isLoading: updateUserLoading } = useMutation(
    async () => {
      // If user inputs a file
      if (file) {
        // Generate signature
        const timestamp = Math.round(new Date().getTime() / 1000);
        const res = await axios.post("/api/signature", {
          id: session?.data?.user?.id,
          timestamp: timestamp,
        });

        const [signature, key] = [res.data.signature, res.data.key];

        // Upload profile picture into server
        const formData = new FormData();
        if (
          // Ensure only jpeg or png
          !file ||
          !(file.type === "image/jpeg" || file.type === "image/png") ||
          !session?.data?.user?.id
        ) {
          throw new Error("Please upload a JPEG or PNG file");
        }
        formData.append("file", file);
        formData.append("api_key", key);
        formData.append("eager", "b_rgb:9B9B9B,c_pad,h_150,w_150");
        formData.append("folder", "LeetNode/profile_media");
        formData.append("public_id", session?.data?.user?.id);
        formData.append("timestamp", `${timestamp}`);
        formData.append("signature", signature);
        const imageRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload/",
          formData
        );
        return await axios.post("/api/user/update", {
          id: session?.data?.user?.id,
          nusnetId: userNusnetId,
          nickname: userName,
          image: imageRes?.data?.eager?.[0]?.secure_url, // new image link
        });
      } else {
        return await axios.post("/api/user/update", {
          id: session?.data?.user?.id,
          nusnetId: userNusnetId,
          nickname: userName,
          image: userInfo.image, // current image link
        });
      }
    },
    {
      onSuccess: (res) => {
        queryClient.setQueryData(["userInfo", session?.data?.user?.id], {
          ...userInfo,
          nusnetId: res.data.nusnetId,
          nickname: res.data.nickname,
          image: res.data.image,
        });
      },
      onError: (e) => {
        console.log(e instanceof Error ? e.message : "Unknown error");
      },
    }
  );

  // Upload file into server and update DB
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserNusnetId(userNusnetId.toUpperCase());
    updateUser();
  };

  // Reset form
  const handleReset = useCallback(() => {
    setUserName(userInfo.nickname ?? userInfo.name ?? "");
    setUserNusnetId(userInfo.nusnetId ?? "");
  }, [userInfo.nickname, userInfo.name, userInfo.nusnetId]);

  return (
    <>
      <h1 className="text-center">My Account</h1>
      <hr className="my-4 h-px border-0 bg-gray-200" />
      <form onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <TextInput
              className="mt-4"
              type="text"
              label="Nickname (Visible to everyone)"
              name="name"
              variant="filled"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            {/^(\s*\w+\s*){5,}$/.test(userName) ? null : (
              <p className="text-xs italic text-red-500">
                Nickname must contain at least 5 letters and CANNOT contain
                symbols
              </p>
            )}
            <TextInput
              className="mt-4"
              type="text"
              label="NUSNET ID"
              name="nusnetId"
              variant="filled"
              value={userNusnetId}
              onChange={(e) => setUserNusnetId(e.target.value)}
              required
            />
            {/^[A-Za-z]{1}[0-9]{7}[A-Za-z]{1}$/.test(userNusnetId) ? null : (
              <p className="text-xs italic text-red-500">
                Invalid NUSNETID format (e.g. A0123456X)
              </p>
            )}
          </div>
          <div className="col-span-1 flex-auto items-center justify-center">
            <Center className="mt-3">
              <Avatar
                size={90}
                src={userInfo?.image}
                radius={100}
                className="mb-3"
                imageProps={{ referrerPolicy: "no-referrer" }} // Avoid 403 forbidden error when loading google profile pics
              />
            </Center>
            <FileInput
              className="mt-1"
              placeholder="Upload"
              label="Change profile picture"
              name="image"
              accept="image/png,image/jpeg"
              onChange={setFile}
            />
            <p
              className="mt-1 text-xs italic text-gray-500"
              id="file_input_help"
            >
              * PNG / JPG ONLY
            </p>
          </div>
        </div>
        <Group position="center" mt="xl">
          <Button
            type="submit"
            size="md"
            disabled={
              !/^[A-Za-z]{1}[0-9]{7}[A-Za-z]{1}$/.test(userNusnetId) ||
              !/^(\s*\w+\s*){5,}$/.test(userName)
            }
            loading={updateUserLoading}
          >
            Confirm
          </Button>
          <Button
            variant="white"
            type="button"
            size="md"
            onClick={handleReset}
            className={classes.cancel}
          >
            Cancel
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
