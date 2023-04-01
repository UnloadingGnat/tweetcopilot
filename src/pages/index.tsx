import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {SignInButton, SignOutButton, useUser} from "@clerk/nextjs";

import {api, RouterOutputs} from "~/utils/api";
import Image from "next/image";

const CreatePost = () => {
    const {user} = useUser();

    console.log(user)
    
    if (!user) {
        return null;
    }
    
    return <div className="h-12 mt-10 w-full mt-3 flex gap-3">
        <img src={user.profileImageUrl} alt="profile image" className="rounded-3xl" />
        <input size={60} placeholder="Write a Tweet on autopilot" className="bg-transparent border-b" />
    </div>
    
    
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
    const {post, author} = props;

    return (
        <div className="flex border-b border-slate-500 gap-3 p-8 w-full items-center" key={post.id}>
            <img className="rounded-full w-10" src={author.profileImageUrl} />
            {post.content}
        </div>
    )

}


const Home: NextPage = () => {

  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
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
        <div className="w-full md:border-x flex flex-col justify-center items-center border-slate-500 md:w-1/2">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              Tweet <span className="text-[#1D9BF0]">CoPilot</span>
            </h1>
            <div className="flex justify-center border-b p-4 border-slate-500 w-full">
                {!user.isSignedIn && <SignInButton><div className="p-3 w-[75%] px-6 text-black font-bold bg-white rounded-3xl hover:bg-gray-200 cursor-pointer text-center ">Sign In</div></SignInButton> }
                <div>
                    {user.isSignedIn && <SignOutButton><div className="p-3 px-6 justify-center text-black font-bold bg-white rounded-3xl hover:bg-gray-200 cursor-pointer text-center">Sign Out</div></SignOutButton> }
                    {user.isSignedIn && <CreatePost />}
                </div>
            </div>
            <p className="text-2xl text-center text-white mt-3 pb-3 border-b border-slate-500 w-full">
              Posts
            </p>
            <div className="flex flex-col w-full">
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
