import { ScrollArea, SegmentedControl } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";

import Overall from "./Overall";
import Personal from "./Personal";

export default function Challenge() {
  const [view, setView] = useSessionStorage({
    key: "challengeTab",
    defaultValue: "personal",
  });

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
