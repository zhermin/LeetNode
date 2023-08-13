import "highlight.js/styles/monokai-sublime.css";

import axios from "axios";
import hljs from "highlight.js";
import katex from "katex";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

import RichTextEditor, {
  RichTextEditorProps,
} from "@/packages/mantine-rte/src";
import { Topic, User } from "@prisma/client";

window.katex = katex;

/** upload_preset is a string set in your Cloudinary Settings > Upload to determine the upload rules and the rest of the props are from the now deprecated @mantine/rte [docs]{@link https://v5.mantine.dev/others/rte/} which uses React-Quill under the hood **/
export default function Editor(
  props: { upload_preset: string } & RichTextEditorProps
) {
  const modules = useMemo(
    () => ({
      clipboard: {
        // Toggle to add extra line breaks when pasting HTML
        matchVisual: false,
      },
      syntax: {
        highlight: (text: string) => hljs.highlightAuto(text).value,
      },
    }),
    []
  );

  const { upload_preset } = props;
  const handleImageUpload = useCallback(
    (file: File): Promise<string> =>
      new Promise(async (resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", upload_preset);
        try {
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload",
            formData
          );
          resolve(res.data.secure_url);
        } catch (error) {
          console.error(error);
          toast.error(error instanceof Error ? error.message : "Unknown Error");
          reject(error);
        }
      }),
    [upload_preset]
  );

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<User[]>("/api/forum/getAllUsers");
      return data.map((user: { username: string }) => ({
        value: user.username,
      }));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unknown Error");
      return [];
    }
  };

  const fetchTopics = async () => {
    try {
      const { data } = await axios.get<Topic[]>("/api/forum/getAllTopicNames");
      return data.map((topic: { topicName: string }) => ({
        value: topic.topicName,
      }));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unknown Error");
      return [];
    }
  };

  const mentions = useMemo(
    () => ({
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@", "#"],
      source: async (
        searchTerm: string,
        renderList: (items: { value: string }[]) => void,
        mentionChar: string
      ) => {
        const list: { value: string }[] =
          mentionChar === "@" ? await fetchUsers() : await fetchTopics();
        const includesSearchTerm = list
          .filter((item) =>
            item.value.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 5);
        renderList(includesSearchTerm);
      },
    }),
    []
  );

  return (
    <RichTextEditor
      modules={modules}
      controls={[
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "codeBlock", "formula"],
        ["h1", "h2", "h3"],
        ["orderedList", "unorderedList"],
        ["alignLeft", "alignCenter", "alignRight"],
        ["sub", "sup"],
        ["link", "image", "video"],
        ["clean"],
      ]}
      sticky={true}
      onImageUpload={handleImageUpload}
      mentions={mentions}
      placeholder="Type @ or # for user and topic autocompletes"
      {...props}
    />
  );
}
