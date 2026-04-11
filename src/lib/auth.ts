import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

// Inline PrismaAdapter to avoid ESM/CJS interop issues with @auth/prisma-adapter
function PrismaAdapter(p: any) {
  return {
    createUser: (data: any) => p.user.create({ data }),
    getUser: (id: string) => p.user.findUnique({ where: { id } }),
    getUserByEmail: (email: string) => p.user.findUnique({ where: { email } }),
    getUserByAccount: async (provider_providerAccountId: any) => {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: ({ id, ...data }: any) => p.user.update({ where: { id }, data }),
    deleteUser: (id: string) => p.user.delete({ where: { id } }),
    linkAccount: (data: any) => p.account.create({ data }),
    unlinkAccount: (provider_providerAccountId: any) =>
      p.account.delete({ where: { provider_providerAccountId } }),
    async getSessionAndUser(sessionToken: string) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
    createSession: (data: any) => p.session.create({ data }),
    updateSession: (data: any) =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: (sessionToken: string) =>
      p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data: any) {
      const verificationToken = await p.verificationToken.create({ data });
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token: any) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        });
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        if ((error as any).code === "P2025") return null;
        throw error;
      }
    },
  };
}

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
