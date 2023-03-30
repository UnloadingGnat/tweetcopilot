import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {SignInButton, SignOutButton, useUser} from "@clerk/nextjs";

import { api } from "~/utils/api";

const Home: NextPage = () => {

  const user = useUser();

  const { data } = api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Tweet CoPilot</title>
        <meta name="description" content="tweet co" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Tweet <span className="text-[hsl(280,100%,70%)]">CoPilot</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href=""
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href=""
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="p4 ">
            {!user.isSignedIn && <SignInButton />}
            {user.isSignedIn && <SignOutButton />}
          </div>
          <p className="text-2xl text-white">
            Posts
          </p>
          <div>
            {data?.map((post) => (<div key={post.id}>{post.content}</div>))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
