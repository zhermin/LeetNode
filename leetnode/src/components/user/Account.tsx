import axios from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import {
  Avatar,
  Button,
  Center,
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

  const [userName, setUserName] = useState(
    userInfo.nickname ?? (userInfo.name || "")
  );
  const [userNusnetId, setUserNusnetId] = useState(userInfo.nusnetId ?? "");

  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  // Update the user in the DB
  const { mutate: updateUser, isLoading: updateUserLoading } = useMutation(
    async (image: string) => {
      return await axios.post("/api/user/update", {
        id: session?.data?.user?.id,
        nusnetId: userNusnetId,
        nickname: userName,
        image: image,
      });
    },
    {
      onSuccess: (res) => {
        queryClient.setQueryData(["userInfo", session?.data?.user?.id], {
          ...userInfo,
          nusnetId: res.data.nusnetId,
          nickname: res.data.nickname,
          image: res.data.image,
        });
        toast.success("Updated!", { id: "updateUserInfo" }); // Notification for successful update
      },
      onError: () => {
        toast.error("Failed", { id: "updateUserInfo" }); // Notification for failed update
      },
    }
  );

  const { mutate: uploadImage, isLoading: uploadImageLoading } = useMutation(
    async () => {
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
      return await axios.post(
        "https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload/",
        formData
      );
    },
    {
      onSuccess: (res) => {
        updateUser(res?.data?.eager?.[0]?.url);
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Unknown error", {
          id: "updateUserInfo",
        }); // Notification for failed update
      },
    }
  );

  // Upload file into server and update DB
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserNusnetId(userNusnetId.toUpperCase());

    toast.loading("Updating...", { id: "updateUserInfo" }); // Notification for updating user
    // If user inputs a file
    if (file) {
      uploadImage(); // Generate signature, upload file into server and update DB
    } else {
      updateUser(userInfo.image); // Update DB
    }
  };

  // Reset form
  const handleReset = useCallback(() => {
    setUserName(userInfo.nickname ?? userInfo.name);
    setUserNusnetId(userInfo.nusnetId ?? "");
  }, [userInfo.nickname, userInfo.name, userInfo.nusnetId]);

  return (
    <>
      <h1 className="text-center">My Account</h1>
      <hr className="h-px my-4 bg-gray-200 border-0" />
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6 grid-cols-3">
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
              <p className="text-red-500 text-xs italic">
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
              <p className="text-red-500 text-xs italic">
                Invalid NUSNETID format (e.g. A0123456X)
              </p>
            )}
          </div>
          <div className="col-span-1 flex-auto justify-center items-center">
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
              className="mt-1 text-gray-500 text-xs italic"
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
            loading={updateUserLoading || uploadImageLoading}
          >
            Confirm
          </Button>
          <Button variant="white" type="button" size="md" onClick={handleReset}>
            Cancel
          </Button>
        </Group>
      </form>
    </>
  );
}
