import NextAuth, { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

// Extend Session type to include custom fields
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
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
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
  },
  events: {
    signIn: async ({ user }) => {
      // Redirect to dashboard after successful sign in
    },
  },
 
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
