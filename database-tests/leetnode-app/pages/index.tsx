import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react';
import Axios from 'axios';

/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/

export default function Example() {

  const [fileSelected, setFileSelected] = useState<string | Blob>('');

  const uploadImage = () => {
    const formData = new FormData();
    formData.append("file", fileSelected);
    formData.append("upload_preset", "w2ul1sgu");

    Axios.post("https://api.cloudinary.com/v1_1/dy2tqc45y/image/upload", formData
    ).then((res)=>{
      console.log(res)}
    ).catch(e => {
      console.log(e);
  });
  };

  return (
    <>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Prof Add Question</h3>
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
                      <label htmlFor="question-topic" className="block text-sm font-medium text-gray-700">
                        Question Topic
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <select
                          id="question-topic"
                          name="question-topic"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                          <option>Topic 1</option>
                          <option>Topic 2</option>
                          <option>Topic 3</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="question-content" className="block text-sm font-medium text-gray-700">
                      Question Content
                    </label>
                  </div>
                  <textarea
                    className="
                      form-control
                      block
                      w-full
                      px-3
                      py-1.5
                      text-base
                      font-normal
                      text-gray-700
                      bg-white bg-clip-padding
                      border border-solid border-gray-300
                      rounded
                      transition
                      ease-in-out
                      m-0
                      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                    "
                    id="Question Content"
                    rows= {3}
                    placeholder="Question Content"
                  ></textarea>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Media</label>
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
                              type = "file"
                              onChange={(e) => {
                                setFileSelected(e.target.files![0]!);
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">Any files up to 100MB</p>
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

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Student Answer Question</h3>
              <p className="mt-1 text-sm text-gray-600">Testing for GET question and media from Cloudinary</p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form action="#" method="POST">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <fieldset>
                    <legend className="contents text-base font-medium text-gray-900">Question 1</legend>
                    <p className="text-sm text-gray-500">To have content from planetscale</p>
                    <img 
                      src="https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q01-1_bzugpn.png"/>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="option-1"
                          name="option-1"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="option-1" className="ml-3 block text-sm font-medium text-gray-700">
                          0.2A
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="option-2"
                          name="option-2"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="option-2" className="ml-3 block text-sm font-medium text-gray-700">
                          1A
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="option-3"
                          name="option-3"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="option-3" className="ml-3 block text-sm font-medium text-gray-700">
                          0.6A
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="option-4"
                          name="option-4"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        <label htmlFor="option-4" className="ml-3 block text-sm font-medium text-gray-700">
                          0.8A
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
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
    </>
  )
  }