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
      const user = await User.findOne({ email: session.user.email })
      if(!user) return session
      session.user = user

      const menuItems = await Promise.all(user.access.map(async (data: { accessId: string; permissions: any }) => {
        const { accessId, permissions } = data;
        const menuItem = await buildAccessTree(accessId._id.toHexString());
        return { menuItem, permissions };
      }));
      session.menuItems = menuItems
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


//custom functions
async function buildAccessTree(accessId: string) {
  try {
    console.log({ accessId });

    // Ensure database connection
    await dbConnect();

    // Validate and convert accessId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(accessId)) {
      throw new Error("Invalid accessId");
    }
    const accessObjectId = new mongoose.Types.ObjectId(accessId);

    // Perform aggregation query
    const tree = await Access.aggregate([
      {
        $match: { _id: accessObjectId }, // Match the starting node
      },
      {
        $graphLookup: {
          from: "accesses", // Ensure this matches your MongoDB collection name
          startWith: "$parent", // Start from the parent field of the starting node
          connectFromField: "parent",
          connectToField: "_id",
          as: "ancestors",
        },
      },
    ]);

    if (tree.length === 0) {
      console.warn("No matching tree found. Check your accessId and data consistency.");
      return [];
    }

    console.log("Raw Tree Data:", JSON.stringify(tree, null, 2));

    // Use ancestors and node directly to build the structure
    const node = tree[0];
    const ancestors = [...node.ancestors, node]; // Ancestors in original order

    // Convert all IDs to strings for consistent matching
    const stringifiedAncestors = ancestors.map((ancestor) => ({
      ...ancestor,
      _id: ancestor._id.toString(),
      parent: ancestor.parent ? ancestor.parent.toString() : null,
    }));

    // Build the navMain structure
    const navMain = buildNavStructure(stringifiedAncestors);
    console.log("Final NavMain Structure:", JSON.stringify(navMain, null, 2));
    return navMain;
  } catch (e) {
    console.error("Error building access tree:", e.message, e.stack);
    return [];
  }
}

// Helper function to build NavMain structure
function buildNavStructure(ancestors: any[]) {
  if (!ancestors || ancestors.length === 0) {
    return null;
  }

  // Create a map to track nodes by their `_id`
  const nodeMap = new Map();

  // Step 1: Build all nodes and store them in the map
  ancestors.forEach((ancestor) => {
    const node = {
      title: ancestor.name,
      url: ancestor.url || '#',
      icon: '', // Add your icon logic here
      isActive: ancestor.isActive || false,
      items: [],
    };
    nodeMap.set(ancestor._id, node);
  });

  // Step 2: Nest nodes into their parents
  ancestors.forEach((ancestor) => {
    const currentNode = nodeMap.get(ancestor._id);

    if (ancestor.parent) {
      const parentNode = nodeMap.get(ancestor.parent);

      if (parentNode && currentNode) {
        parentNode.items.push(currentNode);
      }
    }
  });

  // Step 3: Find and return the root node (node with no parent)
  const rootAncestor = ancestors.find((ancestor) => ancestor.parent === null);
  if (rootAncestor) {
    return nodeMap.get(rootAncestor._id);
  } else {
    return null;
  }
}



export { handler as GET, handler as POST };
