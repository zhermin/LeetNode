import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import MainWrapper from "@/components/MainWrapper";
import axios from "axios";
import { useRouter } from "next/router";

import {
  PrismaClient,
  Topic,
  Question,
  QuestionMedia,
  Answer,
  Course,
} from "@prisma/client";

const prisma = new PrismaClient();

interface topicQuestionProp {
  topic: Topic[];
  question: Question[];
  questionMedia: QuestionMedia[];
  answer: Answer[];
}

interface courseProps {
  course: Course[];
  topic: Topic[];
}

export async function getServerSideProps() {
  const courses: Course[] = await prisma.course.findMany();

  const topics: Topic[] = await prisma.topic.findMany();
  // const questions: Question[] = await prisma.question.findMany({
  //   // where: {
  //   //   topicName: params.id,
  //   // },
  // });
  // const questionMedia: QuestionMedia[] = await prisma.questionMedia.findMany();
  // const answers: Answer[] = await prisma.answer.findMany();

  return {
    props: {
      topic: topics,
      // question: questions,
      // questionMedia: questionMedia,
      // answer: answers,
      course: courses,
    },
  };
}

export default function Index({ course, topic }: courseProps) {
  // const [courses] = useState(course);
  const [fileSelected, setFileSelected] = useState<string | Blob>("");
  const [courses, coursesSelected] = useState(course[0]?.courseSlug);
  const [, setLoading] = useState(false);
  const router = useRouter();

  async function uploadImage() {
    const formData = new FormData();
    formData.append("file", fileSelected);
    formData.append("resource_type", "auto");
    formData.append("upload_preset", "w2ul1sgu");

    axios
      .post("https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload", formData)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log(event.target.value);
    setLoading(true);
    const selected = {
      topicName: event.target.value,
    };
    console.log(JSON.stringify(selected));
    const res = await fetch("/api/question/questions", {
      method: "POST",
      body: JSON.stringify(selected),
    });

    const load = await res.json();
    console.log(load);
  }

  return (
    <>
      <Header />
      <Navbar />
      <MainWrapper>
        <div className="pt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Prof Add Question
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Testing for POST question and media to Cloudinary
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form action="#" method="POST">
                <div className="shadow sm:overflow-hidden sm:rounded-md">
                  <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-3 sm:col-span-2">
                        <label
                          htmlFor="question-course"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Question Topic
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <select
                            id="question-course"
                            name="question-course"
                            value={courses}
                            onChange={(e) => handleChange(e)}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          >
                            {course.map((c: Course) => (
                              <option key={c.courseName}>{c.courseName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="question-content"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Question Content
                      </label>
                    </div>
                    <textarea
                      className="
                      form-control
                      m-0
                      block
                      w-full
                      rounded
                      border
                      border-solid
                      border-gray-300
                      bg-white bg-clip-padding
                      px-3 py-1.5 text-base
                      font-normal
                      text-gray-700
                      transition
                      ease-in-out
                      focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none
                      "
                      id="Question Content"
                      rows={3}
                      placeholder="Question Content"
                    ></textarea>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Media
                      </label>
                      <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                onChange={(e) => {
                                  // get a possibly null file object
                                  const file = e.target.files?.[0];
                                  // if the file exists, set the state
                                  if (file) {
                                    setFileSelected(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">
                            Any files up to 100MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                      onClick={uploadImage}
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5">
            <div className="border-t border-gray-200" />
          </div>
        </div>

        <div className="pt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Recommender Microservice POST test
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Testing for POST to Recommender Microservice
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form action="#" method="POST">
                <div className="shadow sm:overflow-hidden sm:rounded-md">
                  <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                    <div>
                      <label
                        htmlFor="question-content"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Student_Id
                      </label>
                    </div>
                    <textarea
                      className="
                      form-control
                      m-0
                      block
                      w-full
                      rounded
                      border
                      border-solid
                      border-gray-300
                      bg-white bg-clip-padding
                      px-3 py-1.5 text-base
                      font-normal
                      text-gray-700
                      transition
                      ease-in-out
                      focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none
                      "
                      id="Question Content"
                      rows={3}
                      placeholder="Question Content"
                    ></textarea>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                      onClick={uploadImage}
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5">
            <div className="border-t border-gray-200" />
          </div>
        </div>

        <div className="mt-10 pb-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Student Answer Question
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Testing for POST question and media from Cloudinary
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="col-span-3 sm:col-span-2">
                    <label
                      htmlFor="question-topic"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Question Topic
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-5 p-10 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                    {course.map((c: Course) => (
                      <Link
                        href={{
                          pathname: `/cloudinary/[courseSlug]`,
                          query: {
                            courseSlug: c.courseSlug,
                          },
                        }}
                        as={`/cloudinary/${c.courseSlug}`}
                        key={c.courseSlug}
                      >
                        <div className="flex cursor-pointer flex-col rounded shadow-lg first-letter:overflow-hidden">
                          <div className="px-6 py-4">
                            <div className="mb-2 text-xl font-bold">
                              {c.courseName}
                            </div>
                            <p className="text-base text-gray-700">
                              Lorem ipsum dolor sit amet, consectetur
                              adipisicing elit. Voluptatibus quia, Nonea!
                              Maiores et perferendis eaque, exercitationem
                              praesentium nihil.
                            </p>
                          </div>
                          <div className="mt-auto px-6 pt-4 pb-2 text-left">
                            <span className="mr-2 mb-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                              #placeholder
                            </span>
                          </div>
                        </div>

                        {/* <button
                          type="button"
                          className="mt-1 w-full rounded-md bg-purple-500 py-2 px-3 text-white shadow-sm hover:bg-purple-600 sm:text-sm"
                        >
                          {t.topicName}
                        </button> */}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-purple-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-600"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainWrapper>
    </>
  );
}
