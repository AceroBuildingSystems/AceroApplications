import NextAuth, { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongoose";
import { Access, User } from "@/models";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

declare module "next-auth" {
  interface Session {
    user: any
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

    async session({ session }) {
      await dbConnect();
    
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        console.error("User not found");
        return session;
      }
    
      session.user = user;

      // Collect all access IDs and build access map for permissions
      const accessIdsUnfiltered = user.access.map((data: { accessId: any }) => data.accessId);
      const accessIds = accessIdsUnfiltered.filter((id: any) => id); // Remove nulls

      const accessMap = new Map(
        user.access
          .filter((data: { permissions: any }) => data.permissions.view) // Only include viewable items
          .map((data: { accessId: any; permissions: any }) => [
            data.accessId?._id?.toString(), // Ensure the key is a string
            { permissions: data.permissions },
          ])
      );

      const trees = await Access.aggregate([
        {
          $match: {
            _id: { $in: accessIds.map((id) => new mongoose.Types.ObjectId(id)) },
          },
        },
        {
          $graphLookup: {
            from: "accesses", 
            startWith: "$parent",
            connectFromField: "parent",
            connectToField: "_id",
            as: "ancestors",
          },
        },
      ]);
    
      // console.debug("Trees", trees);
      // Combine all ancestors and nodes into a single list
      const allAncestors = trees.flatMap((tree) => [...tree.ancestors, tree]);
    
      // Remove duplicates by `_id`
      const uniqueAncestors = Array.from(
        new Map(allAncestors.map((ancestor) => [ancestor._id.toString(), ancestor])).values()
      );
    
      // Build the unified menu structure
      const menuItems = buildNavStructure(
        uniqueAncestors.map((ancestor) => ({
          ...ancestor,
          _id: ancestor?._id?.toString(),
          parent: ancestor.parent ? ancestor?.parent?.toString() : null,
        })),
        accessMap // Pass accessMap to include permissions
      );
    
      session.menuItems = menuItems;
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

// Helper function to build NavMain structure
function buildNavStructure(ancestors: any[], accessMap: Map<string, any>) {
  if (!ancestors || ancestors.length === 0) {
    return null;
  }

  // Create a map to track all nodes
  const nodeMap = new Map();

  // Initialize all nodes
  ancestors.forEach((ancestor) => {
    const nodeId = ancestor?._id?.toString();

    // Retrieve permissions from the accessMap if available
    const permissions = accessMap.get(nodeId)?.permissions || {};
    if (!nodeMap.has(nodeId)) {
      nodeMap.set(nodeId, {
        title: ancestor.name,
        url: ancestor.url || "#",
        category:ancestor.category,
        icon: "", // Add custom logic for icons if necessary
        isActive: ancestor.isActive || false,
        permissions, // Attach permissions here
        items: [],
      });
    }
  });

  // Build parent-child relationships
  ancestors.forEach((ancestor) => {
    const currentNode = nodeMap.get(ancestor._id.toString());
    if (ancestor.parent) {
      const parentNode = nodeMap.get(ancestor.parent.toString());
      if (parentNode) {
        parentNode.items.push(currentNode);
      }
    }
  });

  // Find all root nodes (nodes with no parent)
  const rootNodes = ancestors.filter((ancestor) => !ancestor.parent);
  // Return all root nodes as a unified structure
  return rootNodes.map((root) => nodeMap.get(root._id.toString()));
}

export { handler as GET, handler as POST };
