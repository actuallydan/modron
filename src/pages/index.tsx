import { useState, useRef, useEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState("4rem");
  const [text, setText] = useState("this is super safe text");
  const { data, error, isLoading } = api.moderation.getModeration.useQuery(
    { input: text },
    { enabled: Boolean(text) }
  );

  function calcHeight(value: string) {
    const numberOfLineBreaks = (value.match(/\n/g) || []).length;
    // min-height + lines x line-height + padding + border
    return 20 + numberOfLineBreaks * 20 + 12 + 2;
  }

  useEffect(() => {
    if (inputRef.current) {
      // Dealing with Textarea Height

      inputRef.current.addEventListener("keyup", () => {
        if (!inputRef.current) {
          return;
        }
        setHeight(`${calcHeight(inputRef.current.value)}px`);
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>MODRON MODERATOR</title>
        <meta
          name="description"
          content="Explore text sentiment for moderation using OpenAI"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start">
        <div className="container flex min-w-[320] max-w-3xl flex-col items-start justify-start gap-12 px-4 py-16">
          <h1 className="text-2xl font-bold">
            Enter some example text and see how it scores
          </h1>
          {/* create a nice looking input using tailwind */}
          <textarea
            className=" min-h-[4rem] w-full rounded-md bg-gray-800 px-4 py-2 text-sm text-white transition-all md:text-lg"
            defaultValue={text}
            ref={inputRef}
            style={{ height }}
          />
          <button
            className="rounded-md bg-purple-400 px-4 py-2 text-lg text-white"
            onClick={() => {
              if (inputRef.current) {
                setText(inputRef.current.value);
              }
            }}
          >
            {isLoading ? (
              <div className="flex flex-row items-center">
                <div className="mr-2 animate-bounce">🤔</div>
                Loading...
              </div>
            ) : (
              "Check Text"
            )}
          </button>
          {error ? (
            <code className="w-full whitespace-pre-wrap rounded-md bg-gray-200 px-4 py-2 text-sm text-black md:text-lg">
              {JSON.stringify(error, null, 2)}
            </code>
          ) : (
            <code className="w-full whitespace-pre-wrap rounded-md bg-gray-200 px-4 py-2 text-sm text-black md:text-lg">
              {data
                ? JSON.stringify(data, null, 2)
                : "// You output will appear here"}
            </code>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
