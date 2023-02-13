import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";

import { Button, Center, FileInput, Group, TextInput } from "@mantine/core";

export default function Account(props) {
  const session = useSession();

  const userInfo = props.userInfo;
  const [userName, setUserName] = useState(userInfo.name || "");
  const [userNusnetId, setUserNusnetId] = useState(userInfo.nusnetId || "");
  const [userImage, setUserImage] = useState(userInfo.image || "");

  const [file, setFile] = useState<File | null>(null);
  const { mutate } = useSWRConfig();
  const [uploading, setUploading] = useState(false);

  // Upload file into server and update DB
  const handleSubmit = (e) => {
    e.preventDefault();
    setUserNusnetId(userNusnetId.toUpperCase());
    setUploading(true);

    try {
      // If user inputs a file
      if (file) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        generateSignature(timestamp); // Generate signature, upload file into server and update DB
      } else {
        updateUser(); // Update DB
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Reset form
  const handleReset = useCallback(() => {
    setUserName(userInfo.name);
    setUserNusnetId(userInfo.nusnetId);
  }, [userInfo.name, userInfo.nusnetId]);

  // Update the user in the DB
  const updateUser = useCallback(
    (image = userInfo.image) => {
      axios
        .post("/api/user/update", {
          id: session?.data?.user?.id,
          name: userName,
          nusnetId: userNusnetId.toUpperCase(),
          image: image,
        })
        .then(() => {
          setUploading(false);
          mutate("/api/user/get"); // Trigger a revalidation with key "/api/user/get"
        });
    },
    [session?.data?.user?.id, userName, userNusnetId, userInfo.image, mutate]
  );

  // Generate signature and upload profile picture into server
  const generateSignature = useCallback(
    (timestamp: number) => {
      // Signed upload
      const uploadImage = (
        timestamp: number,
        signature: string,
        key: string
      ) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", key);
        formData.append("eager", "b_rgb:9B9B9B,c_pad,h_150,w_150");
        formData.append("folder", "profiles");
        formData.append("public_id", session?.data?.user?.id);
        formData.append("timestamp", `${timestamp}`);
        formData.append("signature", signature);
        axios
          .post(
            "https://api.cloudinary.com/v1_1/demcj8g8y/image/upload/",
            formData
          )
          .then((response) => {
            // Once file is uploaded, get the URL (transformation configs) and call another function to update DB
            setUserImage(response?.data?.eager?.[0]?.url);
            updateUser(response?.data?.eager?.[0]?.url);
          })
          .catch((error) => {
            console.log(error);
          });
      };

      // Get signature for signed uploads
      axios
        .post("/api/signature", {
          id: session?.data?.user?.id,
          timestamp: timestamp,
        })
        .then((response) => {
          // Upload file into server after signing
          uploadImage(
            timestamp,
            response?.data?.signature,
            response?.data?.key
          );
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [session?.data?.user?.id, file, updateUser]
  );

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
              label="Name"
              name="name"
              variant="filled"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            {/^\w{5,}$/.test(userName) ? null : (
              <p className="text-red-500 text-xs italic">
                Name must be at least 5 letters long and CANNOT contain spaces /
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
              <Image
                src={userImage || ""}
                alt={userName || ""}
                className="new-line ml-1 rounded-full"
                width={90}
                height={90}
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
              className="mt-1 text-gray-50 text-xs italic"
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
              !/^\w{5,}$/.test(userName)
            }
            loading={uploading}
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
