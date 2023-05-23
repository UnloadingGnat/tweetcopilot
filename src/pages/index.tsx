import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { api, RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {LoadingSpinner} from "~/components/loading";
import {useState} from "react";
import {IconSend} from "@tabler/icons-react";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const { user } = useUser();

  const ctx = api.useContext()

  const [input, setInput] = useState("")

  const {mutate, isLoading} = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();

    }
  });



  console.log(user);

  if (!user) {
    return null;
  }

  return (
    <div className="mt-3 flex h-12 w-full gap-3">
      <img
        src={user.profileImageUrl}
        alt="profile image"
        className="rounded-3xl"
      />
      <input
        size={60}
        placeholder="Write a Tweet on autopilot"
        className="border-b bg-transparent outline-0"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={() => mutate({ content: input})}><IconSend /></button>
    </div>
  );
};

// 14416   --------------------------- 14416


type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = ({post, author} : PostWithUser) => {
  
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
                  <div className="cursor-pointer justify-center rounded-3xl bg-white p-3 px-6 text-center font-bold text-black hover:bg-gray-200">
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
