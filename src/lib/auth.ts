import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decode as decodeJwt, encode as encodeJwt } from "next-auth/jwt";
import bcrypt from "bcrypt";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/user";

const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const REMEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 90;

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          username: credentials.username,
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check if user is active
        if (user.status !== "Active") {
          return null;
        }

        const remember = (credentials as Record<string, unknown>)?.remember === "true";

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.username, // NextAuth expects 'email' field
          image: user.avatar,
          role: user.role,
          avatar: user.avatar,
          remember,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id!;
        token.name = user.name;
        token.avatar = (user as { avatar?: string }).avatar ?? token.avatar;
        token.remember = (user as { remember?: boolean }).remember ?? false;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.avatar = session.user.image ?? token.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.name = token.name as string | undefined;
        session.user.image = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: DEFAULT_SESSION_MAX_AGE,
  },
  jwt: {
    maxAge: DEFAULT_SESSION_MAX_AGE,
    encode: async (params) => {
      const token = params.token ?? {};
      const remember = (token as { remember?: boolean }).remember;
      const maxAge = remember ? REMEMBER_SESSION_MAX_AGE : DEFAULT_SESSION_MAX_AGE;

      return encodeJwt({ ...params, token, maxAge });
    },
    decode: async (params) => decodeJwt(params),
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
