import { NextResponse } from 'next/server';
import withAuth from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  async function authorized(req) {
    const token = await getToken({ req });
    const url = req.nextUrl.clone();

    // Redirect to home page if the user is not logged in
    if (!token) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }


    if (url.pathname.startsWith('/globalAdmin')) {
      if (token.role !== 'globalAdmin') {
        url.pathname = '/error';
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }
);

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };