import axios from "axios";
import { useSession } from "next-auth/react";
import Head from "next/head";

const Header = ({ title = "Personalized Path Mastery" }) => {
  const fullTitle = `LeetNode — ${title}`;
  const session = useSession();

  axios
    .post("/api/updateLastActive", { id: session?.data?.user?.id as string })
    .then((response) => console.log(response))
    .catch((error) => console.error(error));

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
