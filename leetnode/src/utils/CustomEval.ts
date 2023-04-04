import { evaluate } from "mathjs";

import { QuestionDataType } from "@/types/question-types";
import { randomId } from "@mantine/hooks";

import { CustomMath } from "./CustomMath";

export const CustomEval = (
  variables?: QuestionDataType["variables"],
  methods?: QuestionDataType["methods"],
  toRandomize = true
) => {
  // For dynamic questions, ensure variables and methods are defined
  if (
    !variables ||
    !methods ||
    variables.length === 0 ||
    methods.length === 0
  ) {
    throw new Error(
      "Please add at least 1 variable and 1 method for dynamic questions"
    );
  }

  // Trim whitespaces from start/end of variable names and methods and validate
  variables?.map((variable) => {
    variable.name = variable.name.trim();
    if (variable.name.length === 0) {
      throw new Error("Variable names cannot be empty");
    }
  });

  methods?.map((method) => {
    method.expr = method.expr.trim();
    if (method.expr.length === 0) {
      throw new Error("Methods cannot be empty");
    }
  });

  // Replace curly and square brackets with parentheses and remove backslashes
  const clean = (str: string) =>
    str
      .replace(/[\[\{]/g, "(")
      .replace(/[\]\}]/g, ")")
      .replace(/[\\]/g, "");

  // Sort and randomize variables and evalutate default values
  let rawVariables: { [key: string]: number };
  try {
    rawVariables = variables
      .sort((a, b) => {
        if (!a.name || !b.name) return 0;
        if (a.isFinalAnswer) return 1;
        if (b.isFinalAnswer) return -1;
        return a.name.localeCompare(b.name);
      })
      .reduce((obj, item) => {
        const itemName = item.encoded;
        if (toRandomize && item.randomize) {
          return {
            ...obj,
            [itemName]: CustomMath.random(
              Number(item.min),
              Number(item.max),
              Number(item.decimalPlaces)
            ),
          };
        }
        return {
          ...obj,
          [itemName]: item.default ? evaluate(clean(item.default)) : undefined,
        };
      }, {});
  } catch (e) {
    throw new Error(
      "Ensure that Default values are either numbers or valid math expressions for dynamic questions"
    );
  }

  console.log("[Raw Variables]", rawVariables);

  // Define custom math functions for common ones
  evaluate("ln(x) = log(x)", rawVariables);

  // Copy all variables and encode them to ensure the expression is valid
  const formVars = [...variables];
  const encode = (str: string) => {
    formVars.sort((a, b) => b.name.length - a.name.length);
    for (const variable of formVars) {
      str = str.replaceAll(variable.name, variable.encoded);
    }
    return str;
  };

  // Evaluate all methods after encoding and cleaning them
  console.log("[Encoded Math Expressions]");
  for (const [index, method] of methods.entries()) {
    try {
      const [lhs, rhs] = method.expr.split("=").map((s) => s.trim());
      if (!lhs || !rhs) throw new Error("Invalid Expression");
      formVars.push({
        key: randomId(),
        name: lhs,
        encoded: CustomMath.randomString(),
        randomize: false,
        isFinalAnswer: false,
      });
      console.log(`${index + 1})`, clean(encode(method.expr)));
      evaluate(clean(encode(method.expr)), rawVariables);
    } catch (e) {
      throw new Error(
        JSON.stringify({
          message: e instanceof Error ? e.message : "Unknown Error",
          index: index + 1,
          expr: method.expr,
          sanitized: clean(method.expr),
          encoded: clean(encode(method.expr)),
        }),
        {
          cause: "invalid-methods",
        }
      );
    }
  }

  // Filter out the final answers and generate 3 incorrect answers to view in the editor
  const finalAnswers = variables?.filter((item) => item.isFinalAnswer);
  if (finalAnswers.length == 0) {
    throw new Error("No final answers specified");
  }

  const editorAnswers = finalAnswers.map((finalAnswer) => {
    if (finalAnswer.decimalPlaces === undefined)
      throw new Error(`Invalid name or decimal places for ${finalAnswer.name}`);

    const finalValue = CustomMath.round(
      Number(rawVariables[finalAnswer.encoded]),
      finalAnswer.decimalPlaces
    );

    if (isNaN(finalValue)) {
      throw new Error(
        `Final answer ${finalAnswer.name} is not a number, please check that it is used in your methods correctly`
      );
    }

    // Randomly generate incorrect answers
    if (finalAnswer.step === 0) {
      throw new Error(`Step size can't be 0 for ${finalAnswer.name}`);
    }
    const incorrectRange = CustomMath.generateRange(
      (finalAnswer.min ?? -90) / 100,
      (finalAnswer.max ?? 90) / 100,
      (finalAnswer.step ?? 20) / 100
    )
      .map((val) =>
        CustomMath.round(
          val,
          finalAnswer.decimalPlaces ?? CustomMath.getDecimalPlaces(finalValue)
        )
      )
      .filter((val) => val !== 0);

    if (incorrectRange.length < 3) {
      throw new Error(
        `Not enough wrong answers for variable:\n${
          finalAnswer.name
        }. Try increasing the decimal places, step size or range.\n\nYour settings generated: [${incorrectRange.map(
          (val) => (val * 100).toString() + "%"
        )}]`
      );
    }

    console.log("[Random Incorrect Final Answers]");
    const incorrectAnswers = (
      CustomMath.nRandomItems(3, incorrectRange) as number[]
    ).map((val) =>
      CustomMath.round(
        finalValue * (1 + val),
        finalAnswer.decimalPlaces ?? CustomMath.getDecimalPlaces(finalValue)
      )
    );

    console.log(finalAnswer.name, incorrectRange, incorrectAnswers);
    return {
      ...finalAnswer,
      answerContent: finalValue,
      isCorrect: true,
      isLatex: true,
      incorrectRange,
      incorrectAnswers: incorrectAnswers.map((val) => ({
        key: randomId(),
        answerContent: val,
        isCorrect: false,
        isLatex: true,
      })),
    };
  });

  // For all final answers, generate 1 correct and 3 incorrect options joined into LaTeX strings
  const correctOption = editorAnswers
    .map((item) => {
      return `${item.name} ${item.unit ? "~(" + item.unit + ")" : ""} = ${
        item.answerContent
      }`;
    })
    .join(",~");

  const incorrectOptions = Array.from(Array(3).keys()).map(() => {
    return editorAnswers
      .map((item) => {
        const incorrectRange = CustomMath.shuffleArray(
          item.incorrectRange
        ) as number[];
        const incorrectAnswer = incorrectRange.pop();
        if (incorrectAnswer === undefined) {
          throw new Error("Not enough wrong answers");
        }
        return `${item.name} ${
          item.unit ? "~(" + item.unit + ")" : ""
        } = ${CustomMath.round(
          item.answerContent * (1 + incorrectAnswer),
          item.decimalPlaces ?? CustomMath.getDecimalPlaces(item.answerContent)
        )}`;
      })
      .join(",~");
  });

  // Clean up variables and final answers for frontend integration
  // TODO: Consider non-number defaults, show original str expr in var but eval in answer
  const questionVariables = variables
    .filter((item) => !item.isFinalAnswer)
    .map((item) => {
      return {
        ...item,
        default: CustomMath.round(
          Number(rawVariables[item.encoded]),
          item?.decimalPlaces ?? 3
        ).toString(),
      };
    });

  const questionAnswers = [
    {
      key: randomId(),
      answerContent: correctOption,
      isCorrect: true,
      isLatex: true,
    },
    ...incorrectOptions.map((item) => ({
      key: randomId(),
      answerContent: item,
      isCorrect: false,
      isLatex: true,
    })),
  ];

  console.log("[GENERATED VARIABLES]", questionVariables);
  console.log("[GENERATED ANSWERS]", questionAnswers);

  return {
    questionVariables,
    editorAnswers,
    questionAnswers,
  };
};
