import { useState } from "react";

import { ScrollArea, SegmentedControl } from "@mantine/core";

import Overall from "./Overall";
import Personal from "./Personal";

export default function Challenge() {
  const [view, setView] = useState("personal");

  return (
    <ScrollArea>
      <h1 className="text-center">Challenge</h1>
      <hr className="my-4 h-px border-0 bg-gray-200" />
      <SegmentedControl
        color="cyan"
        value={view}
        onChange={setView}
        data={[
          { label: "Personal", value: "personal" },
          { label: "Overall", value: "overall" },
        ]}
        fullWidth
      />
      {view === "personal" ? <Personal /> : <Overall />}
    </ScrollArea>
  );
}
