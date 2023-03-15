import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { createStyles, Footer as MantineFooter, Text } from "@mantine/core";

export default function Footer() {
  const { classes } = useStyles();
  const session = useSession();

  useEffect(() => {
    const updateLastActive = async () => {
      try {
        const { data } = await axios.post("/api/prof/updateLastActive", {
          id: session?.data?.user?.id as string,
        });
        return data;
      } catch (error) {
        console.error(error);
        throw new Error("Unable to update last active");
      }
    };
    updateLastActive();
  }, [session?.data?.user?.id]);

  return (
    <MantineFooter className={classes.footer} height={60}>
      <div className={classes.inner}>
        <Text color="dimmed" size="sm">
          © {new Date().getFullYear()} LeetNode. All rights reserved.
        </Text>
      </div>
    </MantineFooter>
  );
}

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
