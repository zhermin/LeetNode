import { QuestionDataType } from "@/types/question-types";
import { CustomMath } from "@/utils/CustomMath";
import { Box } from "@mantine/core";

import Latex from "../Latex";

export default function VariablesBox({
  variables,
}: {
  variables: QuestionDataType["variables"] | null;
}) {
  return variables && variables.length > 0 ? (
    <Box className="my-5 flex items-center justify-center rounded-md border border-solid border-slate-300 bg-slate-200 pt-4 pb-2">
      <Latex>{`$$ \\begin{aligned} ${variables
        .filter((item) => !item.isFinalAnswer)
        .map((item) => {
          return `${item.name} ${
            item.unit ? "~(" + item.unit + ")" : ""
          } &= ${CustomMath.round(
            Number(item.default),
            item?.decimalPlaces ?? 3
          )}`;
        })
        .join("\\\\")} \\end{aligned} $$`}</Latex>
    </Box>
  ) : (
    <></>
  );
}
