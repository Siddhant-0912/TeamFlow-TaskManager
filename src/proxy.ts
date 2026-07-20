import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/projects', '/team'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/team/:path*', '/login', '/signup'],
};
