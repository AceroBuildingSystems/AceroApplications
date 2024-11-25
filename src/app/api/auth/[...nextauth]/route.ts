import NextAuth, { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models";
import { INVALID_CREDENTIALS, SUCCESS } from "@/shared/constants";
import { USER_NOT_FOUND } from "@/shared/constants";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [

    AzureADProvider({
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || "",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as { email: string; password: string };
        await dbConnect()
        const user = await User.findOne({ email })
        const isPasswordValid = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPasswordValid) return null
        return user as any
      },
    }),

  ],
  callbacks: {

    async signIn({ user, account }) {
      await dbConnect();
      // For both Azure AD and Credentials
      const email = user.email;
      const dbUser = await User.findOne({ email });
      
      if(!dbUser) return false
      return true
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.email = token.sub;
      }
      const user = await User.findOne({ email: session.user.email })
      if(!user) return session
      session.user = user
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/error",
  },
  events: {
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
