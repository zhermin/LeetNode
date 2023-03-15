import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  Box,
  Center,
  Group,
  Loader,
  Progress,
  Text,
  Title,
} from "@mantine/core";

const ProgressBar = ({
  topicSlug,
  topicName,
}: {
  topicSlug: string;
  topicName: string;
}) => {
  const session = useSession();

  const [details, setDetails] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .post("/api/pybkt/get", {
        id: session?.data?.user?.id,
        topicSlug: topicSlug,
        //change contents of topicSlug to topicSlug
      })
      .then((response) => {
        setLoading(false);
        setDetails(response.data);
      });
  }, [topicSlug, session?.data?.user?.id]);

  console.log(session?.data?.user?.id);
  console.log(topicSlug);
  const results = details;
  // const results = masteryDisplay[0]?.masteryLevel;
  const roundedResults = Math.round((results as number) * 10000) / 100;
  console.log(roundedResults);

  return (
    <>
      {loading === true ? (
        <Center style={{ height: 500 }}>
          <Loader />
        </Center>
      ) : (
        <Box pt="xl">
          <Group position="apart">
            <Title order={3}>{topicName}</Title>
            {roundedResults !== 0 ? (
              <Title order={2}>{roundedResults}%</Title>
            ) : (
              <Text fw={600}>Do a {`${topicName}`} question first!</Text>
            )}
          </Group>
          <Progress
            mt="md"
            color="cyan"
            radius="xl"
            size="xl"
            value={roundedResults}
            striped
            animate
          />
        </Box>
      )}
    </>
  );
};

export default ProgressBar;
