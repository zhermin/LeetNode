import {
  Attempt,
  Question,
  QuestionDifficulty,
  QuestionWithAddedTime,
  Topic,
} from "@prisma/client";

export type AllQuestionsType = (Question & {
  topic: Topic;
  questionsWithAddedTime: (QuestionWithAddedTime & { attempts: Attempt[] })[];
})[];

export type QuestionFormFullType = {
  baseQuestionId?: string | null;
  variationId: number;
  title: string;
  difficulty?: QuestionDifficulty;
  topic: string;
  variables?: QuestionDataType["variables"];
  methods?: QuestionDataType["methods"];
  hints?: QuestionDataType["hints"];
  answers?: QuestionDataType["answers"];
};

export type QuestionDataType = {
  variables: {
    key: string;
    encoded: string;
    name: string;
    randomize: boolean;
    isFinalAnswer: boolean;
    unit?: string;
    default?: string;
    min?: number;
    max?: number;
    decimalPlaces?: number;
    step?: number;
  }[];
  methods: {
    key: string;
    expr: string;
    explanation?: string;
  }[];
  hints: {
    key: string;
    hint: string;
  }[];
  answers: {
    key: string;
    answerContent: string;
    isCorrect: boolean;
    isLatex: boolean;
  }[];
};
