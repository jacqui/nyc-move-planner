import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// A separate, provider-free NextAuth instance so the middleware bundle
// (which runs on the Edge runtime) never pulls in bcrypt/db code.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
