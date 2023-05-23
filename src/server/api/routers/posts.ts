import {createTRPCRouter, privateProcedure, publicProcedure} from "~/server/api/trpc";
import {clerkClient} from "@clerk/nextjs/server";
import type {User} from "@clerk/nextjs/dist/api";
import {TRPCError} from "@trpc/server";
import {Simulate} from "react-dom/test-utils";
import {z} from "zod";
import input = Simulate.input;

const filterUseForClient = (user: User) => {
  return {
    id: user.id,
    username: user.firstName,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      }
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUseForClient);
    console.log(users);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found",
        });

      return {
        post,
        author: {
          ...author,
          username: author.username || author.id,
        },
      };
    });
  }),

  create: privateProcedure
      .input(
            z.object({
                content: z.string(),
            }
        )
  ).mutation(async ({ctx, input}) => {
    const authorId = ctx.userId;

    return await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content,
      },
    })
  }),

});
