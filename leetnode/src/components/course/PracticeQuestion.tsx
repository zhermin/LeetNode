import axios from "axios";
import DOMPurify from "dompurify";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { QuestionDataType } from "@/types/question-types";
import { CustomMath } from "@/utils/CustomMath";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Loader,
  Modal,
  Paper,
  Radio,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Question, QuestionWithAddedTime } from "@prisma/client";
import { IconBulb } from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import VariablesBox from "../editor/VariablesBox";
import Latex from "../Latex";
import { QuestionDifficultyBadge } from "../misc/Badges";

export type UCQATAnswersType = {
  key: string;
  answerContent: string;
  isCorrect: boolean;
  isLatex: boolean;
}[];

export default function PracticeQuestion() {
  const router = useRouter();
  const currentCourseSlug = router.query.courseSlug as string;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [hintsOpened, setHintsOpened] = useState<boolean>(false);

  const { data: UCQAT } = useQuery({
    queryKey: ["get-ucqat"],
    queryFn: () =>
      axios.get<
        QuestionWithAddedTime & {
          question: Question & {
            topic: {
              topicName: string;
            };
          };
        }
      >(
        `/api/questions/questionsWithAddedTime?courseSlug=${currentCourseSlug}`
      ),
  });

  const useSubmitAnswer = () => {
    const queryClient = useQueryClient();
    const { mutate: submitAnswer, status: submitAnswerStatus } = useMutation({
      mutationFn: ({
        query,
        body,
      }: {
        query: {
          qatId: string;
          userId: string;
          courseSlug: string;
        };
        body: {
          attemptedKeys: string[];
          isCorrect: boolean;
          topicSlug: string;
          topicName: string;
        };
      }) => {
        return axios.post(
          `/api/questions/submitAnswer?qatId=${query.qatId}&userId=${query.userId}&courseSlug=${query.courseSlug}`,
          body
        );
      },
      onSuccess: (res) => {
        setSelectedKeys([]);
        const { data } = res;
        console.log(data);
        toast(
          `[${data.topic}] Mastery: ${CustomMath.round(
            data.masteryLevel * 100,
            1
          )}%`,
          {
            icon: data.isCorrect ? "🎉" : "💪",
            className: `border border-solid ${
              data.isCorrect ? "border-green-500" : "border-red-500"
            }`,
            position: "top-right",
            duration: 5000,
          }
        );
        queryClient.invalidateQueries(["get-ucqat"]);
        queryClient.invalidateQueries(["get-attempts", data.courseSlug]);
      },
    });

    return {
      submitAnswer,
      submitAnswerStatus,
    };
  };

  const { submitAnswer, submitAnswerStatus } = useSubmitAnswer();

  if (!UCQAT) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Loader />
      </Center>
    );
  }

  if (!UCQAT.data) {
    return (
      <Center className="h-[calc(100vh-180px)]">
        <Text>Stay tuned, more questions are coming your way!</Text>
      </Center>
    );
  }

  const answerOptions = UCQAT.data.answers as QuestionDataType["answers"];

  const correctKeys = answerOptions
    .filter((item) => item.isCorrect)
    .map((item) => item.key);

  return (
    <Paper p="xl" radius="md" withBorder>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedKeys.length === 0) {
            toast.error("Please select an option");
            return;
          }
          submitAnswer({
            query: {
              qatId: UCQAT.data.qatId,
              userId: UCQAT.data.userId,
              courseSlug: currentCourseSlug,
            },
            body: {
              attemptedKeys: selectedKeys,
              isCorrect:
                selectedKeys.length === correctKeys.length &&
                selectedKeys.every((item) => correctKeys.includes(item)),
              topicSlug: UCQAT.data.question.topicSlug,
              topicName: UCQAT.data.question.topic.topicName,
            },
          });
        }}
      >
        <QuestionDifficultyBadge
          questionDifficulty={UCQAT.data.question.questionDifficulty}
          {...{ radius: "lg", size: "md" }}
        />
        <div
          className="rawhtml rawhtml-lg-img mt-4"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(UCQAT.data.question.questionContent),
          }}
        />
        <VariablesBox
          variables={UCQAT.data.variables as QuestionDataType["variables"]}
        />
        {correctKeys.length === 1 ? (
          <Radio.Group
            mt="xl"
            value={selectedKeys[0]}
            onChange={(value) => {
              console.log(
                value === answerOptions.find((item) => item.isCorrect)?.key
              );
              setSelectedKeys([value]);
            }}
            orientation="vertical"
            description="Select only one option"
            required
          >
            {answerOptions.map((item) => (
              <Radio
                key={item.key}
                value={item.key}
                label={
                  item.isLatex ? (
                    <Latex>{`$$ ${item.answerContent} $$`}</Latex>
                  ) : (
                    <Text>{item.answerContent}</Text>
                  )
                }
                className="flex items-center justify-start rounded-md border border-solid border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
              />
            ))}
          </Radio.Group>
        ) : (
          <Checkbox.Group
            mt="xl"
            value={selectedKeys}
            onChange={(values) => {
              console.log(
                values.length === correctKeys.length &&
                  values.every((item) => correctKeys.includes(item))
              );
              setSelectedKeys(values);
            }}
            orientation="vertical"
            description="Select all correct options"
            required
          >
            {answerOptions.map((item) => (
              <Checkbox
                key={item.key}
                value={item.key}
                label={
                  item.isLatex ? (
                    <Latex>{item.answerContent}</Latex>
                  ) : (
                    <Text>{item.answerContent}</Text>
                  )
                }
                className="flex items-center justify-start rounded-md border border-solid border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
              />
            ))}
          </Checkbox.Group>
        )}
        <Flex mt="xl" align="center" gap="md">
          <Button
            type="submit"
            variant="light"
            fullWidth
            loading={submitAnswerStatus === "loading"}
          >
            {submitAnswerStatus === "loading" ? "Submitting..." : "Submit"}
          </Button>
          {(UCQAT.data.question.questionData as QuestionDataType).hints && (
            <Tooltip label="Hints" withArrow>
              <ActionIcon
                size="lg"
                variant="light"
                radius="xl"
                onClick={() => setHintsOpened(true)}
              >
                <IconBulb size={20} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>

        {/* Hints Modal */}
        <Modal
          opened={hintsOpened}
          onClose={() => setHintsOpened(false)}
          title="Hints"
          size="md"
        >
          <Stack>
            {(UCQAT.data.question.questionData as QuestionDataType).hints?.map(
              (item, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-start gap-3 rounded-md border border-solid border-gray-200 bg-gray-100 p-2"
                >
                  <Text color="dimmed">#{index + 1}</Text>
                  <Text>{item.hint}</Text>
                </Box>
              )
            )}
          </Stack>
        </Modal>
      </form>
    </Paper>
  );
}
