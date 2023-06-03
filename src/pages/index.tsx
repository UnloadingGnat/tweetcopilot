import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import TextareaAutosize from "react-textarea-autosize";

import { api, RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { IconFeather, IconSend } from "@tabler/icons-react";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import Image from "next/image";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const { user } = useUser();
  const [tweet, setTweet] = useState<string>("");
  const [generatedTweet, setGeneratedTweet] = useState<string>("");

  const prompt = `Write a twitter tweet in 240 characters or less for the following context: ${
    tweet.trim().split(/\s+/).length < 150 && tweet ? tweet : " test"
  }${tweet.slice(-1) === "." ? "" : "."}`;
  const generateTweet = async (e: any) => {
    e.preventDefault();
    setGeneratedTweet("");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          console.log(text);
          setGeneratedTweet((prev) => prev + text);
        } catch (e) {
          console.error(e);
        }
      }
    };

    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
  };

  const validateAndMutate = (tweetContent: string) => {
    let tweet = tweetContent;
    if (
      tweetContent[0] !== '"' ||
      tweetContent[tweetContent.length - 1] !== '"'
    ) {
      tweet = tweetContent.slice(1, tweetContent.length - 1);
    }
    if (tweetContent.length > 280) {
      mutate({ content: tweet.slice(0, 280) });
      return;
    }
    mutate({ content: tweet });
  };

  const ctx = api.useContext();

  const [input, setInput] = useState("");

  const { mutate, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setTweet("");
      setGeneratedTweet("");
      void ctx.posts.getAll.invalidate();
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-w-full flex-col">
      <div className="mt-3 flex h-fit w-full gap-3 md:justify-center">
        <div>
          <Image
            src={user.profileImageUrl}
            width={50}
            height={50}
            alt="profile image"
            className="rounded-3xl"
          />
        </div>
        <TextareaAutosize
          placeholder="Write a Tweet on autopilot"
          className="resize-none border-b bg-transparent p-2 text-white outline-none md:w-96"
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          disabled={isLoading}
        />

        <button onClick={generateTweet}>
          <IconFeather />
        </button>
      </div>
      {generatedTweet && (
        <div className="flex flex-col">
          <div className="mt-4 rounded-xl border border-slate-500 p-5">
            {generatedTweet}
          </div>
          <div className="mt-3 flex justify-end gap-5">
            <div className="italic">
              This content was generated by{" "}
              <a
                className="cursor-pointer text-gray-400"
                href="https://openai.com/blog/openai-api/"
              >
                OpenAI&apos;s GPT-3
              </a>
            </div>
            <button onClick={() => validateAndMutate(generatedTweet)}>
              <IconSend />
            </button>
          </div>
        </div>
      )}
      {/*<IconSend />*/}
    </div>
  );
};

// 14416   --------------------------- 14416

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = ({ post, author }: PostWithUser) => {
  return (
    <div
      className="flex w-full items-center gap-3 border-b border-slate-500 p-8"
      key={post.id}
    >
      <img
        alt="Author of post profile pic"
        className="w-10 rounded-full"
        src={author.profileImageUrl}
      />
      <div className="flex flex-col">
        <span className="text-gray-400">
          {`@${author.username}`} · {`${dayjs(post.createdAt).fromNow()}`}
        </span>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  return (
    <>
      <Head>
        <title>Tweet CoPilot</title>
        <meta name="description" content="tweet co" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <div className="flex w-full flex-col items-center justify-center border-slate-500 md:w-1/2 md:border-x">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Tweet <span className="text-[#1D9BF0]">CoPilot</span>
          </h1>
          <div className="flex w-full justify-center border-b border-slate-500 p-4">
            {!user.isSignedIn && (
              <SignInButton>
                <div className="w-[75%] cursor-pointer rounded-3xl bg-white p-3 px-6 text-center font-bold text-black hover:bg-gray-200 ">
                  Sign In
                </div>
              </SignInButton>
            )}
            <div>
              {user.isSignedIn && (
                <SignOutButton>
                  <div className="cursor-pointer rounded-3xl bg-white p-3 px-6 text-center font-bold text-black hover:bg-gray-200">
                    Sign Out
                  </div>
                </SignOutButton>
              )}
              {user.isSignedIn && <CreatePost />}
            </div>
          </div>
          <p className="mt-3 w-full border-b border-slate-500 pb-3 text-center text-2xl text-white">
            Posts
          </p>
          <div className="flex w-full flex-col">
            {...data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
