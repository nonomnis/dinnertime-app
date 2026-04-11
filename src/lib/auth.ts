import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
// Use require with webpackIgnore to prevent webpack from bundling @auth/prisma-adapter
// which internally imports @prisma/client and causes "en is not a constructor" error
const { PrismaAdapter } = require(/* webpackIgnore: true */ "@auth/prisma-adapter");
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        // Look up FamilyMember to get role
        const familyMember = await prisma.familyMember.findFirst({
          where: {
            userId: token.id as string,
            isActive: true,
          },
          include: {
            family: true,
          },
        });

        if (familyMember) {
          (session.user as any).familyId = familyMember.familyId;
          (session.user as any).role = familyMember.role;
        }
      }
      return session;
    },
  },
});
