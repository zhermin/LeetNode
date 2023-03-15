import axios from "axios";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";

const Header = ({ title = "Personalized Path Mastery" }) => {
  const fullTitle = `LeetNode — ${title}`;
  const session = useSession();

  useEffect(() => {
    const updateLastActive = async () => {
      try {
        const { data } = await axios.post("/api/prof/updateLastActive", {
          id: session?.data?.user?.id as string,
        });
        console.log("Last active updated:", data);
      } catch (error) {
        console.error(error);
      }
    };

    // Update last active immediately on component mount
    updateLastActive();

    // Schedule update every 5 minutes
    const intervalId = setInterval(updateLastActive, 5 * 60 * 1000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta
        name="description"
        content="Achieve mastery in concepts by doing questions tailored to your skill level. Receive feedback on your progression and challenge yourself as you advance through progressively more advanced questions for each individual topic."
      />
      <link rel="icon" href="/logo/leetnode-logo.png" />
    </Head>
  );
};

export default Header;
