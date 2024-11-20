import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // Redirect to the login page if not authenticated
  },
});

export const config = {
  matcher: ["/protected/:path*"], // Protect these routes
};
