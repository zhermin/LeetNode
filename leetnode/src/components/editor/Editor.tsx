import "highlight.js/styles/monokai-sublime.css";

import hljs from "highlight.js";
import katex from "katex";
import { useState } from "react";
import ReactQuill from "react-quill";

window.katex = katex;

export default function Editor() {
  const [quillHtml, setQuillHtml] = useState("");

  return (
    <ReactQuill
      onChange={setQuillHtml}
      value={quillHtml}
      theme="snow"
      bounds={".quill"}
      placeholder="Compose an epic..."
      modules={Editor.modules}
      formats={undefined}
    />
  );
}

Editor.modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
    [{ script: "sub" }, { script: "super" }],
    ["link", "image", "video", "formula"],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML
    matchVisual: false,
  },
  syntax: {
    highlight: (text: string) => hljs.highlightAuto(text).value,
  },
};
