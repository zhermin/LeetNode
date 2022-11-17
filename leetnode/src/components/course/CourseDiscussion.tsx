import {
  Card,
  Group,
  Badge,
  Button,
  Text,
  Container,
  Center,
  Loader,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import ForumPost from "@/components/course/ForumPost";
import { Comment, PostMedia } from "@prisma/client";

type postType = {
  postId: string;
  userId: string;
  title: string;
  postType: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  postMedia: PostMedia[];
  comment: Comment[];
} | null;

const CourseDiscussion = () => {
  const {
    data: posts,
    isLoading,
    isFetching,
    isError,
  } = useQuery(["all-posts"], async () => {
    const res = await axios.get("http://localhost:3000/api/forum/getAllPosts");
    return res.data;
  });

  const [redirect, setRedirect] = useState(false);
  const [postData, setPostData] = useState<postType>(null);

  function handleClick(post: postType) {
    setRedirect(true);
    setPostData(post);
  }

  if (isLoading || isFetching || !posts)
    return (
      <Center className="h-screen">
        <Loader />
      </Center>
    );
  if (isError) return <div>Something went wrong!</div>;

  return (
    <>
      {redirect ? (
        <ForumPost post={postData} setRedirect={setRedirect} />
      ) : (
        <>
          <Title align="center">Discussion Forum</Title>
          <Container size="md">
            {posts.map((post: postType) => (
              <Card
                shadow="sm"
                p="md"
                radius="md"
                withBorder
                key={post?.postId}
                mt="lg"
              >
                <Group position="apart" mb="xs">
                  <Text weight={500}>{post?.title}</Text>
                  <Badge
                    color={
                      post?.postType === "Content"
                        ? "cyan"
                        : post?.postType === "Quiz"
                        ? "blue"
                        : "gray"
                    }
                    variant="light"
                  >
                    {post?.postType}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed">
                  {post?.message}
                </Text>
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => handleClick(post)}
                >
                  See Discussion Thread
                </Button>
              </Card>
            ))}
          </Container>
        </>
      )}
    </>
  );
};

export default CourseDiscussion;

// import {
//   Group,
//   Avatar,
//   Text,
//   Accordion,
//   Card,
//   Badge,
//   Button,
//   Title,
//   Container,
// } from "@mantine/core";

// const charactersList = [
//   {
//     id: "bender",
//     image: "https://img.icons8.com/clouds/256/000000/futurama-bender.png",
//     label: "Bender Bending Rodríguez",
//     description: "Fascinated with cooking, though has no sense of taste",
//     content:
//       "Bender Bending Rodríguez, (born September 4, 2996), designated Bending Unit 22, and commonly known as Bender, is a bending unit created by a division of MomCorp in Tijuana, Mexico, and his serial number is 2716057. His mugshot id number is 01473. He is Fry's best friend.",
//   },

//   {
//     id: "carol",
//     image: "https://img.icons8.com/clouds/256/000000/futurama-mom.png",
//     label: "Carol Miller",
//     description: "One of the richest people on Earth",
//     content:
//       "Carol Miller (born January 30, 2880), better known as Mom, is the evil chief executive officer and shareholder of 99.7% of Momcorp, one of the largest industrial conglomerates in the universe and the source of most of Earth's robots. She is also one of the main antagonists of the Futurama series.",
//   },

//   {
//     id: "homer",
//     image: "https://img.icons8.com/clouds/256/000000/homer-simpson.png",
//     label: "Homer Simpson",
//     description: "Overweight, lazy, and often ignorant",
//     content:
//       "Homer Jay Simpson (born May 12) is the main protagonist and one of the five main characters of The Simpsons series(or show). He is the spouse of Marge Simpson and father of Bart, Lisa and Maggie Simpson.",
//   },
// ];

// interface AccordionLabelProps {
//   label: string;
//   image: string;
//   description: string;
// }

// function AccordionLabel({ label, image, description }: AccordionLabelProps) {
//   return (
//     <Group noWrap>
//       <div>
//         <Group position="apart" mt="md" mb="xs">
//           <Group>
//             <Avatar src={image} radius="xl" size="lg" />
//             <Text weight={500}>{label}</Text>
//           </Group>
//           <Badge color="pink" variant="light">
//             On Sale
//           </Badge>
//         </Group>

//         <Text size="sm" color="dimmed">
//           {description}
//         </Text>

//         <Button variant="light" color="blue" fullWidth mt="md" radius="md">
//           Book classic tour now
//         </Button>
//       </div>
//     </Group>
//   );
// }

// function Demo() {
//   const items = charactersList.map((item) => (
//     <Accordion.Item value={item.id} key={item.label}>
//       <Accordion.Control>
//         <Card shadow="sm" p="lg" radius="md" withBorder>
//           <AccordionLabel {...item} />
//         </Card>
//       </Accordion.Control>
//       <Accordion.Panel>
//         <Text size="sm">{item.content}</Text>
//       </Accordion.Panel>
//     </Accordion.Item>
//   ));

//   return (
//     <Container size="sm">
//       <Title align="center">Course Discussion</Title>
//       <Accordion>{items}</Accordion>
//     </Container>
//   );
// }

// export default Demo;
