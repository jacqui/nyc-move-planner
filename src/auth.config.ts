import type { NextAuthConfig } from "next-auth";

// No providers here on purpose — providers (and anything they need, like
// bcrypt) pull in Node APIs that don't run in the Edge middleware. This
// file only has what's needed to read/validate the session JWT.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
  },
  providers: [],
};
