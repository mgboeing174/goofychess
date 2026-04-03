import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        let user = await prisma.user.findUnique({
          where: { username: credentials.username as string }
        });

        // For local development ease, auto-register if user doesn't exist
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password as string, 10);
          user = await prisma.user.create({
            data: {
              username: credentials.username as string,
              passwordHash: hashedPassword,
            }
          });
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) return null;

        return { id: user.id, name: user.username }
      }
    })
  ],
})
