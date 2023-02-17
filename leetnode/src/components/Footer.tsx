import axios from "axios";
import { useSession } from "next-auth/react";

import { createStyles, Footer as MantineFooter, Text } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: `${theme.spacing.lg}px`,
  },
}));

export default function Footer() {
  const { classes } = useStyles();
  const session = useSession();

  axios
    .post("/api/updateLastActive", { id: session?.data?.user?.id as string })
    .then((response) => console.log(response))
    .catch((error) => console.error(error));

  return (
    <MantineFooter className={classes.footer} height={60}>
      <div className={classes.inner}>
        <Text color="dimmed" size="sm">
          © 2022 LeetNode. All rights reserved.
        </Text>
      </div>
    </MantineFooter>
  );
}
