import Head from "next/head";

const Header = ({ title = "Personalized Path Mastery" }) => {
  const fullTitle = `LeetNode — ${title}`;
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
